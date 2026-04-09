"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createTask, deleteTask } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Eye } from "lucide-react";
import type { Task } from "@/lib/types";

export default function TarefasPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchTasks() {
    const res = await fetch("/api/admin/tasks");
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCreate(formData: FormData) {
    await createTask(formData);
    setOpen(false);
    fetchTasks();
  }

  async function handleDelete(id: string) {
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
          <DialogTrigger
            render={<Button />}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova tarefa.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="lesson_id">ID da Aula (opcional)</Label>
                <Input id="lesson_id" name="lesson_id" />
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Data de Entrega</TableHead>
              <TableHead>Aula</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.due_date ?? "Sem prazo"}</TableCell>
                <TableCell>{task.lesson_id ?? "Avulsa"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/tarefas/${task.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
