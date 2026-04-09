"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createLesson, deleteLesson } from "@/app/actions/admin";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye } from "lucide-react";
import type { Lesson } from "@/lib/types";

export default function AulasPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchLessons() {
    const res = await fetch("/api/admin/lessons");
    if (res.ok) {
      const data = await res.json();
      setLessons(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLessons();
  }, []);

  async function handleCreate(formData: FormData) {
    await createLesson(formData);
    setOpen(false);
    fetchLessons();
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
    await deleteLesson(id);
    fetchLessons();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Aulas</h1>
          <p className="text-muted-foreground">
            Gerencie as aulas da Escola Bíblica
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button />}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Aula
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Aula</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova aula.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="week_number">Semana</Label>
                <Input
                  id="week_number"
                  name="week_number"
                  type="number"
                  min={1}
                  required
                />
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
                <Label htmlFor="date">Data</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <Button type="submit" className="w-full">
                Criar Aula
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : lessons.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma aula cadastrada.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Semana</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>
                  <Badge variant="outline">{lesson.week_number}</Badge>
                </TableCell>
                <TableCell className="font-medium">{lesson.title}</TableCell>
                <TableCell>{lesson.date}</TableCell>
                <TableCell>
                  {lesson.checkin_token ? (
                    <Badge>Aberto</Badge>
                  ) : (
                    <Badge variant="secondary">Fechado</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/aulas/${lesson.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(lesson.id)}
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
