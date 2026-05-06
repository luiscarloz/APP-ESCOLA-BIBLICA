"use client";

import { useState, useTransition } from "react";
import { createTask } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/types";

export function LessonTasks({
  lessonId,
  tasks,
}: {
  lessonId: string;
  tasks: Task[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("lesson_id", lessonId);
    startTransition(async () => {
      try {
        await createTask(formData);
        toast.success("Tarefa criada!");
        setShowForm(false);
        window.location.reload();
      } catch {
        toast.error("Erro ao criar tarefa.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Tarefas desta Aula
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl"
          >
            <Plus className="mr-1 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form action={handleSubmit} className="space-y-3 rounded-xl border bg-muted/30 p-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Título</Label>
              <Input id="task-title" name="title" required placeholder="Ex: Leitura do capítulo 3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-desc">Descrição</Label>
              <Textarea id="task-desc" name="description" placeholder="Detalhes da tarefa..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Data de Entrega</Label>
              <Input id="task-due" name="due_date" type="date" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending} size="sm" className="rounded-xl">
                {isPending ? "Criando..." : "Criar Tarefa"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="rounded-xl">
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {tasks.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma tarefa vinculada a esta aula.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border p-3"
              >
                <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                  )}
                </div>
                {task.due_date && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {task.due_date}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
