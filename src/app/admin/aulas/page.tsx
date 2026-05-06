"use client";

import type { ElementType } from "react";
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
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Globe,
  Landmark,
  Plus,
  Trash2,
  Triangle,
} from "lucide-react";
import type { LessonWithTrack, CourseTrack } from "@/lib/types";
import { cn } from "@/lib/utils";

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

const iconMap: Record<string, ElementType> = {
  triangle: Triangle,
  globe: Globe,
  "book-open": BookOpen,
  landmark: Landmark,
};

export default function AulasPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<LessonWithTrack[]>([]);
  const [tracks, setTracks] = useState<CourseTrack[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);

  async function fetchLessons() {
    const res = await fetch("/api/admin/lessons");
    if (res.ok) {
      const data = await res.json();
      setLessons(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);

      const [lessonsRes, tracksRes] = await Promise.all([
        fetch("/api/admin/lessons"),
        fetch("/api/admin/tracks"),
      ]);

      if (!active) return;

      if (lessonsRes.ok) {
        setLessons(await lessonsRes.json());
      }
      if (tracksRes.ok) {
        setTracks(await tracksRes.json());
      }
      setLoading(false);
    }

    loadData();

    return () => {
      active = false;
    };
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

  const lessonsByTrack = new Map<string, LessonWithTrack[]>();
  const unassignedLessons: LessonWithTrack[] = [];

  for (const lesson of lessons) {
    if (!lesson.track_id) {
      unassignedLessons.push(lesson);
      continue;
    }
    if (!lessonsByTrack.has(lesson.track_id)) {
      lessonsByTrack.set(lesson.track_id, []);
    }
    lessonsByTrack.get(lesson.track_id)!.push(lesson);
  }

  const orderedTracks = tracks.slice().sort((a, b) => {
    const turmaA = a.turma ?? 99;
    const turmaB = b.turma ?? 99;
    if (turmaA !== turmaB) return turmaA - turmaB;
    return a.name.localeCompare(b.name, "pt-BR");
  });

  function renderLessonRow(lesson: LessonWithTrack) {
    return (
      <div
        key={lesson.id}
        role="button"
        tabIndex={0}
        className="group flex cursor-pointer items-center gap-3 border-t px-4 py-3 transition-colors first:border-t-0 hover:bg-muted/40"
        onClick={() => router.push(`/admin/aulas/${lesson.id}`)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push(`/admin/aulas/${lesson.id}`);
          }
        }}
      >
        <Badge variant="outline" className="shrink-0 px-2.5 py-1">
          Aula {String(lesson.week_number).padStart(2, "0")}
        </Badge>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{lesson.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{lesson.date}</span>
            {lesson.checkin_open ? (
              <Badge>Aberto</Badge>
            ) : (
              <Badge variant="secondary">Fechado</Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(event) => {
            event.stopPropagation();
            handleDelete(lesson.id);
          }}
          aria-label={`Excluir ${lesson.title}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    );
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
        <div className="space-y-3">
          {orderedTracks.map((track) => {
            const trackLessons = lessonsByTrack.get(track.id) ?? [];
            const colors = colorMap[track.color || "violet"] || colorMap.violet;
            const TrackIcon = iconMap[track.icon || "book-open"] || BookOpen;
            const expanded = expandedTrackId === track.id;

            return (
              <Card
                key={track.id}
                className="overflow-hidden"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/40"
                  onClick={() =>
                    setExpandedTrackId(expanded ? null : track.id)
                  }
                  aria-expanded={expanded}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                      colors.bg,
                      colors.text,
                      colors.border
                    )}
                  >
                    <TrackIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold">
                        {track.name}
                      </p>
                      {track.turma && (
                        <Badge variant="outline">Turma {track.turma}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {trackLessons.length === 1
                        ? "1 aula cadastrada"
                        : `${trackLessons.length} aulas cadastradas`}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </button>
                {expanded && (
                  <CardContent className="p-0">
                    {trackLessons.length === 0 ? (
                      <p className="border-t px-4 py-4 text-sm text-muted-foreground">
                        Nenhuma aula cadastrada neste tema.
                      </p>
                    ) : (
                      trackLessons
                        .slice()
                        .sort((a, b) => a.week_number - b.week_number)
                        .map(renderLessonRow)
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {unassignedLessons.length > 0 && (
            <Card className="overflow-hidden border-dashed">
              <button
                type="button"
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/40"
                onClick={() =>
                  setExpandedTrackId(
                    expandedTrackId === "unassigned" ? null : "unassigned"
                  )
                }
                aria-expanded={expandedTrackId === "unassigned"}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold">Sem tema</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {unassignedLessons.length === 1
                      ? "1 aula sem matéria vinculada"
                      : `${unassignedLessons.length} aulas sem matéria vinculada`}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                    expandedTrackId === "unassigned" && "rotate-180"
                  )}
                />
              </button>
              {expandedTrackId === "unassigned" && (
                <CardContent className="p-0">
                  {unassignedLessons
                    .slice()
                    .sort((a, b) => a.week_number - b.week_number)
                    .map(renderLessonRow)}
                </CardContent>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
