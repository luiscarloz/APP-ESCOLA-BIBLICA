import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Triangle,
  Globe,
  Landmark,
  FileText,
  ExternalLink,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { getOrCreateStudentServer } from "@/lib/get-student";
import { getStudentTurma, getTurmaTrackIds } from "@/lib/get-turma";
import type { LessonWithTrack, Attendance, Task, TaskSubmission } from "@/lib/types";
import { TaskSubmissionForm } from "../tarefas/task-submission-form";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ElementType> = {
  triangle: Triangle,
  globe: Globe,
  "book-open": BookOpen,
  landmark: Landmark,
};

const badgeColorMap: Record<string, string> = {
  violet: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
  blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
};

export default async function AulasPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Faça login para ver suas aulas.
        </p>
      </div>
    );
  }

  const student = await getOrCreateStudentServer();
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Seu cadastro está sendo processado.
        </p>
      </div>
    );
  }

  const turma = await getStudentTurma(student.id);
  if (!turma) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Sua turma ainda não foi definida.
        </p>
      </div>
    );
  }

  const turmaTrackIds = await getTurmaTrackIds(turma);
  const supabase = createAdminClient();

  const [lessonsRes, attendancesRes] = await Promise.all([
    supabase
      .from("lessons")
      .select("*, course_tracks(name, color, icon, turma)")
      .in("track_id", turmaTrackIds)
      .order("week_number"),
    supabase
      .from("attendances")
      .select("lesson_id")
      .eq("student_id", student.id),
  ]);

  const lessons = (lessonsRes.data as LessonWithTrack[] | null) ?? [];
  const lessonIds = lessons.map((lesson) => lesson.id);
  const [tasksRes, submissionsRes] = lessonIds.length
    ? await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .in("lesson_id", lessonIds)
          .order("created_at", { ascending: true }),
        supabase
          .from("task_submissions")
          .select("*")
          .eq("student_id", student.id),
      ])
    : [{ data: [] }, { data: [] }];

  const tasksByLesson = new Map<string, Task[]>();
  for (const task of (tasksRes.data as Task[] | null) ?? []) {
    if (!task.lesson_id) continue;
    if (!tasksByLesson.has(task.lesson_id)) tasksByLesson.set(task.lesson_id, []);
    tasksByLesson.get(task.lesson_id)!.push(task);
  }

  const submittedTaskIds = new Set(
    ((submissionsRes.data as TaskSubmission[] | null) ?? []).map(
      (submission) => submission.task_id
    )
  );

  const attendedLessonIds = new Set(
    (attendancesRes.data as Pick<Attendance, "lesson_id">[] | null)?.map(
      (a) => a.lesson_id
    ) ?? []
  );

  // Group lessons by week_number
  const grouped = new Map<number, LessonWithTrack[]>();
  for (const lesson of lessons) {
    const week = lesson.week_number;
    if (!grouped.has(week)) grouped.set(week, []);
    grouped.get(week)!.push(lesson);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Aulas</h1>
          <Badge variant="outline" className="text-xs font-semibold">
            Turma {turma}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Acompanhe suas aulas e presenças.
        </p>
      </div>

      {lessons.length === 0 && (
        <p className="text-center text-muted-foreground py-10">
          Nenhuma aula cadastrada ainda.
        </p>
      )}

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([week, weekLessons]) => (
          <div key={week} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Semana {week}
            </h2>
            {weekLessons.map((lesson) => {
              const attended = attendedLessonIds.has(lesson.id);
              const lessonTasks = tasksByLesson.get(lesson.id) ?? [];
              const trackColor = lesson.course_tracks?.color || "blue";
              const TrackIcon = iconMap[lesson.course_tracks?.icon || "book-open"] || BookOpen;
              const trackBadgeClasses = badgeColorMap[trackColor] || badgeColorMap.blue;

              return (
                <Card key={lesson.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                            trackBadgeClasses
                          )}>
                            <TrackIcon className="h-3 w-3" />
                            {lesson.course_tracks?.name}
                          </span>
                        </div>
                        <CardTitle className="text-base">
                          {lesson.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(lesson.date), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={attended ? "default" : "secondary"}
                        className={cn(
                          "shrink-0",
                          attended
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : ""
                        )}
                      >
                        {attended ? "Presente" : "Pendente"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {lesson.description}
                      </p>
                    )}
                    {lesson.material_url && (
                      <Link
                        href={lesson.material_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {lesson.material_title || "Ver Material"}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    )}
                    {lessonTasks.length > 0 && (
                      <div className="mt-4 space-y-3 rounded-lg border bg-muted/20 p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <ClipboardList className="h-4 w-4" />
                          Tarefas desta aula
                        </div>
                        {lessonTasks.map((task) => {
                          const submitted = submittedTaskIds.has(task.id);

                          return (
                            <div key={task.id} className="space-y-3 rounded-md bg-background p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 space-y-1">
                                  <p className="text-sm font-medium">{task.title}</p>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {task.description}
                                    </p>
                                  )}
                                  {task.due_date && (
                                    <p className="text-xs text-muted-foreground">
                                      Prazo:{" "}
                                      {format(new Date(task.due_date), "dd/MM/yyyy", {
                                        locale: ptBR,
                                      })}
                                    </p>
                                  )}
                                </div>
                                <Badge variant={submitted ? "default" : "secondary"} className="shrink-0">
                                  {submitted ? "Feita" : "Pendente"}
                                </Badge>
                              </div>
                              {submitted ? (
                                <div className="flex items-center gap-2 text-sm text-green-700">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Tarefa marcada como feita.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <Link
                                    href={`/aluno/tarefas#task-${task.id}`}
                                    className={cn(
                                      buttonVariants({
                                        variant: "outline",
                                        size: "sm",
                                      }),
                                      "rounded-lg"
                                    )}
                                  >
                                    Abrir tarefa
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                  </Link>
                                  <TaskSubmissionForm taskId={task.id} compact />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
