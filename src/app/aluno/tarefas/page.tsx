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
import { ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { TaskWithSubmission } from "@/lib/types";
import { TaskSubmissionForm } from "./task-submission-form";

export const dynamic = "force-dynamic";

export default async function TarefasPage() {
  const { userId } = await auth();
  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("clerk_id", userId!)
    .single();

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

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, task_submissions!left(*)")
    .eq("task_submissions.student_id", student.id)
    .order("created_at", { ascending: true });

  const taskList = (tasks as TaskWithSubmission[] | null) ?? [];

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
            <Card key={task.id}>
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
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm font-medium mb-1">Sua resposta:</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.content || "Arquivo enviado"}
                    </p>
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
