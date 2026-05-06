"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitTask } from "@/app/actions/student";

interface TaskSubmissionFormProps {
  taskId: string;
  compact?: boolean;
}

export function TaskSubmissionForm({ taskId, compact = false }: TaskSubmissionFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { status: string; error?: string }, formData: FormData) => {
      try {
        const result = await submitTask(taskId, formData);
        if (!result.success) {
          return {
            status: "error",
            error: result.message,
          };
        }
        return { status: "success" };
      } catch {
        return {
          status: "error",
          error: "Erro ao enviar tarefa. Tente novamente.",
        };
      }
    },
    { status: "idle" }
  );

  if (state.status === "success") {
    return (
      <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
        Tarefa enviada com sucesso!
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`content-${taskId}`}>
          {compact ? "Resposta" : "Sua resposta"}
        </Label>
        <Textarea
          id={`content-${taskId}`}
          name="content"
          placeholder="Escreva sua resposta aqui..."
          rows={compact ? 3 : 5}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`file-url-${taskId}`}>Link do arquivo (opcional)</Label>
        <Input
          id={`file-url-${taskId}`}
          name="file_url"
          type="url"
          placeholder="https://drive.google.com/..."
        />
      </div>
      {state.status === "error" && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar tarefa"}
      </Button>
    </form>
  );
}
