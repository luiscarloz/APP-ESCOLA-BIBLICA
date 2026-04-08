import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CheckCircle,
  Circle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { CertificateDownload } from "./certificate-download";
import type { Lesson, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CertificadoPage() {
  const { userId } = await auth();
  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, name")
    .eq("clerk_id", userId!)
    .single();

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Award className="h-10 w-10 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Seu cadastro esta sendo processado.
        </p>
      </div>
    );
  }

  // Fetch all data in parallel
  const [lessonsRes, tasksRes, attendancesRes, submissionsRes] =
    await Promise.all([
      supabase.from("lessons").select("id, week_number, title, date").order("week_number"),
      supabase.from("tasks").select("id, title, lesson_id").order("created_at"),
      supabase
        .from("attendances")
        .select("lesson_id")
        .eq("student_id", student.id),
      supabase
        .from("task_submissions")
        .select("task_id")
        .eq("student_id", student.id),
    ]);

  const lessons = (lessonsRes.data as Pick<Lesson, "id" | "week_number" | "title" | "date">[]) ?? [];
  const tasks = (tasksRes.data as Pick<Task, "id" | "title" | "lesson_id">[]) ?? [];
  const attendedLessonIds = new Set(
    (attendancesRes.data ?? []).map((a: any) => a.lesson_id)
  );
  const submittedTaskIds = new Set(
    (submissionsRes.data ?? []).map((s: any) => s.task_id)
  );

  const attendanceCount = attendedLessonIds.size;
  const submissionCount = submittedTaskIds.size;
  const totalLessons = Math.max(lessons.length, 12);
  const totalTasks = Math.max(tasks.length, 12);

  const attendancePercent = Math.round((attendanceCount / totalLessons) * 100);
  const tasksPercent = Math.round((submissionCount / totalTasks) * 100);
  const overallPercent = Math.round(
    ((attendanceCount + submissionCount) / (totalLessons + totalTasks)) * 100
  );

  const eligible = attendanceCount >= 10;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Certificado</h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhe seu progresso no curso de 12 semanas.
        </p>
      </div>

      {/* Overall progress */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Big progress ring */}
          <div className="flex items-center gap-8">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-muted"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${overallPercent * 3.14} 314`}
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-2xl font-extrabold">
                {overallPercent}%
              </span>
            </div>
            <div className="flex-1 space-y-4">
              {/* Attendance bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    Presencas
                  </span>
                  <span className="font-bold text-primary">
                    {attendanceCount}/{totalLessons}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
                    style={{ width: `${attendancePercent}%` }}
                  />
                </div>
              </div>
              {/* Tasks bar */}
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <ClipboardCheck className="h-4 w-4 text-chart-2" />
                    Tarefas
                  </span>
                  <span className="font-bold text-chart-2">
                    {submissionCount}/{totalTasks}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-chart-2 to-chart-2/70 transition-all duration-700"
                    style={{ width: `${tasksPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status message */}
          <div
            className={`rounded-xl p-4 ${
              eligible
                ? "bg-green-50 text-green-800"
                : "bg-primary/5 text-foreground"
            }`}
          >
            {eligible ? (
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Parabens! Voce ja pode emitir seu certificado!
              </p>
            ) : (
              <p className="text-sm">
                Voce precisa de pelo menos <strong>10 presencas</strong> para
                emitir o certificado. Faltam{" "}
                <strong>{Math.max(0, 10 - attendanceCount)}</strong> presenca
                {10 - attendanceCount !== 1 ? "s" : ""}.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Lessons timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Aulas (12 semanas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lessons.length > 0 ? (
                lessons.map((lesson) => {
                  const attended = attendedLessonIds.has(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-lg p-2 text-sm"
                    >
                      {attended ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={
                          attended ? "font-medium" : "text-muted-foreground"
                        }
                      >
                        Semana {lesson.week_number}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {lesson.title}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma aula cadastrada ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-chart-2" />
              Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasks.length > 0 ? (
                tasks.map((task, i) => {
                  const submitted = submittedTaskIds.has(task.id);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg p-2 text-sm"
                    >
                      {submitted ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={
                          submitted ? "font-medium" : "text-muted-foreground"
                        }
                      >
                        Tarefa {i + 1}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground truncate max-w-[120px]">
                        {task.title}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhuma tarefa cadastrada ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate */}
      {eligible && (
        <CertificateDownload
          studentName={student.name}
          completionDate={format(new Date(), "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        />
      )}
    </div>
  );
}
