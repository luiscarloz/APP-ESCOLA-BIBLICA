import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { TaskWithSubmission } from "@/lib/types";
import { TaskSubmissionForm } from "./task-submission-form";
import { getOrCreateStudentServer } from "@/lib/get-student";
import { getStudentTurma, getTurmaTrackIds } from "@/lib/get-turma";

export const dynamic = "force-dynamic";

export default async function TarefasPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <ClipboardList className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Faça login para ver suas tarefas.
        </p>
      </div>
    );
  }

  const supabase = createAdminClient();

  const student = await getOrCreateStudentServer();
  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <ClipboardList className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Seu cadastro está sendo processado.
        </p>
      </div>
    );
  }

  const turma = await getStudentTurma(student.id);
  const turmaTrackIds = turma ? await getTurmaTrackIds(turma) : [];

  const [tasksRes, submissionsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, lessons(id, title, week_number, track_id, course_tracks(name, color, icon, turma))")
      .order("created_at", { ascending: true }),
    supabase
      .from("task_submissions")
      .select("*")
      .eq("student_id", student.id),
  ]);

  const submissionsByTask = new Map(
    (submissionsRes.data ?? []).map((submission) => [submission.task_id, submission])
  );

  const taskList = ((tasksRes.data as TaskWithSubmission[] | null) ?? [])
    .filter((task) => {
      if (!task.lesson_id) return true;
      return turmaTrackIds.includes(task.lessons?.track_id ?? "");
    })
    .map((task) => ({
      ...task,
      task_submissions: submissionsByTask.has(task.id)
        ? [submissionsByTask.get(task.id)!]
        : [],
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tarefas</h1>
        <p className="text-muted-foreground">
          Veja suas tarefas e envie suas respostas.
        </p>
      </div>

      <div className="space-y-4">
        {taskList.map((task) => {
          const submission = task.task_submissions?.[0] ?? null;
          const submitted = !!submission;

          return (
            <Card
              key={task.id}
              id={`task-${task.id}`}
              className="scroll-mt-24 target:ring-2 target:ring-primary/40"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  <Badge variant={submitted ? "default" : "secondary"}>
                    {submitted ? "Enviada" : "Pendente"}
                  </Badge>
                </div>
                {task.description && (
                  <CardDescription>{task.description}</CardDescription>
                )}
                {task.due_date && (
                  <p className="text-xs text-muted-foreground">
                    Prazo:{" "}
                    {format(new Date(task.due_date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                )}
                {task.lessons && (
                  <p className="text-xs text-muted-foreground">
                    Semana {task.lessons.week_number}: {task.lessons.title}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-medium mb-1">Sua resposta:</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.content || "Arquivo enviado"}
                    </p>
                    {submission.file_url && (
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Abrir arquivo enviado
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Enviada em{" "}
                      {format(
                        new Date(submission.submitted_at),
                        "dd/MM/yyyy 'as' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                ) : (
                  <TaskSubmissionForm taskId={task.id} />
                )}
              </CardContent>
            </Card>
          );
        })}

        {taskList.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            Nenhuma tarefa disponível ainda.
          </p>
        )}
      </div>
    </div>
  );
}
