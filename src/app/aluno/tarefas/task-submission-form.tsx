"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitTask } from "@/app/actions/student";

interface TaskSubmissionFormProps {
  taskId: string;
}

export function TaskSubmissionForm({ taskId }: TaskSubmissionFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { status: string; error?: string }, formData: FormData) => {
      try {
        await submitTask(taskId, formData);
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
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`content-${taskId}`}>Sua resposta</Label>
        <Textarea
          id={`content-${taskId}`}
          name="content"
          placeholder="Escreva sua resposta aqui..."
          rows={4}
          required
        />
      </div>
      {state.status === "error" && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Enviando..." : "Enviar Tarefa"}
      </Button>
    </form>
  );
}
