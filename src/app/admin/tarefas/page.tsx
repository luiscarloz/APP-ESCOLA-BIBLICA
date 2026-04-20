"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTask, deleteTask } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, ClipboardList, BookOpen } from "lucide-react";
import type { Task, Lesson } from "@/lib/types";

interface LessonOption {
  id: string;
  title: string;
  week_number: number;
  course_tracks: { name: string } | null;
}

export default function TarefasPage() {
  const [tasks, setTasks] = useState<(Task & { lessons?: { title: string; week_number: number } | null })[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchTasks() {
    const res = await fetch("/api/admin/tasks");
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }

  async function fetchLessons() {
    const res = await fetch("/api/admin/lessons");
    if (res.ok) setLessons(await res.json());
  }

  useEffect(() => {
    fetchTasks();
    fetchLessons();
  }, []);

  async function handleCreate(formData: FormData) {
    await createTask(formData);
    setOpen(false);
    fetchTasks();
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    await deleteTask(id);
    fetchTasks();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie as tarefas da Escola Bíblica
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha os dados e vincule a uma aula.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson_id">Aula vinculada</Label>
                <select
                  id="lesson_id"
                  name="lesson_id"
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Nenhuma (tarefa geral)</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      Semana {l.week_number} — {l.title}
                      {l.course_tracks ? ` (${l.course_tracks.name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Data de Entrega</Label>
                <Input id="due_date" name="due_date" type="date" />
              </div>
              <Button type="submit" className="w-full">
                Criar Tarefa
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma tarefa cadastrada.</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => router.push(`/admin/tarefas/${task.id}`)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {task.lessons ? (
                      <Badge variant="secondary" className="text-xs">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Semana {task.lessons.week_number} — {task.lessons.title}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Tarefa geral</Badge>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Entrega: {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(task.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
