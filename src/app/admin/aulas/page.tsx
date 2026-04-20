"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createLesson, deleteLesson } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import type { LessonWithTrack, CourseTrack } from "@/lib/types";

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

export default function AulasPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<LessonWithTrack[]>([]);
  const [tracks, setTracks] = useState<CourseTrack[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  async function fetchLessons() {
    const res = await fetch("/api/admin/lessons");
    if (res.ok) {
      const data = await res.json();
      setLessons(data);
    }
    setLoading(false);
  }

  async function fetchTracks() {
    const res = await fetch("/api/admin/tracks");
    if (res.ok) {
      const data = await res.json();
      setTracks(data);
    }
  }

  useEffect(() => {
    fetchLessons();
    fetchTracks();
  }, []);

  async function handleCreate(formData: FormData) {
    if (selectedTrackId) {
      formData.set("track_id", selectedTrackId);
    }
    await createLesson(formData);
    setOpen(false);
    setSelectedTrackId(null);
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
              <div className="space-y-2">
                <Label>Matéria</Label>
                <Select
                  value={selectedTrackId ?? undefined}
                  onValueChange={(val) => setSelectedTrackId(val || null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    {tracks.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}{track.turma ? ` (Turma ${track.turma})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <div className="grid gap-3">
          {lessons.map((lesson) => {
            const trackColor = lesson.course_tracks?.color || "violet";
            const colors = colorMap[trackColor] || colorMap.violet;
            return (
              <Card
                key={lesson.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => router.push(`/admin/aulas/${lesson.id}`)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <Badge variant="outline" className="shrink-0 text-base px-3 py-1">
                    {lesson.week_number}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{lesson.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{lesson.date}</span>
                      {lesson.course_tracks && (
                        <Badge
                          variant="outline"
                          className={`${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          {lesson.course_tracks.name}
                        </Badge>
                      )}
                      {lesson.checkin_token ? (
                        <Badge>Aberto</Badge>
                      ) : (
                        <Badge variant="secondary">Fechado</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(lesson.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
