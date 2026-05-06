"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateLesson } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { toast } from "sonner";
import type { CourseTrack, Lesson } from "@/lib/types";

export function LessonDetailsForm({
  lesson,
  tracks,
}: {
  lesson: Lesson;
  tracks: CourseTrack[];
}) {
  const router = useRouter();
  const [trackId, setTrackId] = useState(lesson.track_id ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("track_id", trackId);

    startTransition(async () => {
      try {
        await updateLesson(lesson.id, formData);
        toast.success("Aula atualizada.");
        router.refresh();
      } catch {
        toast.error("Erro ao atualizar aula.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da aula</CardTitle>
        <CardDescription>
          Edite o nome, semana, data, descrição e matéria vinculada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Nome da aula</Label>
            <Input id="title" name="title" defaultValue={lesson.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="week_number">Semana</Label>
            <Input
              id="week_number"
              name="week_number"
              type="number"
              min={1}
              max={12}
              defaultValue={lesson.week_number}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" name="date" type="date" defaultValue={lesson.date} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="track_id">Matéria</Label>
            <select
              id="track_id"
              value={trackId}
              onChange={(event) => setTrackId(event.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Sem matéria</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                  {track.turma ? ` (Turma ${track.turma})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={lesson.description ?? ""}
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isPending}>
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
