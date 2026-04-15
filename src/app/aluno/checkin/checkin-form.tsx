"use client";

import { useState, useTransition } from "react";
import { performCheckin } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  KeyRound,
  RefreshCw,
  Triangle,
  Globe,
  BookOpen,
  Landmark,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { LessonWithTrack } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  triangle: Triangle,
  globe: Globe,
  "book-open": BookOpen,
  landmark: Landmark,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

interface LessonItem extends LessonWithTrack {
  alreadyCheckedIn: boolean;
}

export function CheckinForm({
  lessons,
  turma,
}: {
  lessons: LessonItem[];
  turma: number;
}) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLesson || !password.trim()) return;

    startTransition(async () => {
      const res = await performCheckin(selectedLesson, password);
      setResult(res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  // Result screen
  if (result) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div
          className={`flex h-28 w-28 items-center justify-center rounded-full ${
            result.success
              ? "bg-gradient-to-br from-green-100 to-green-50"
              : "bg-gradient-to-br from-red-100 to-red-50"
          }`}
        >
          {result.success ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive" />
          )}
        </div>
        <Card className="w-full text-center">
          <CardHeader>
            <CardTitle className="text-xl">
              {result.success ? "Check-in Realizado!" : "Erro no Check-in"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{result.message}</p>
            <Button
              onClick={() => {
                setResult(null);
                setPassword("");
                setSelectedLesson(null);
              }}
              variant="outline"
              className="rounded-xl"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No open lessons
  if (lessons.length === 0) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Clock className="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle>Nenhum check-in aberto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não há aulas da Turma {turma} com check-in aberto no momento.
            Aguarde o professor abrir o check-in.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Select lesson
  if (!selectedLesson) {
    return (
      <div className="w-full max-w-md space-y-4">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Turma {turma} — Selecione a aula:
        </p>
        {lessons.map((lesson) => {
          const track = lesson.course_tracks;
          const Icon = iconMap[track?.icon || "book-open"] || BookOpen;
          const colors = colorMap[track?.color || "violet"] || colorMap.violet;

          if (lesson.alreadyCheckedIn) {
            return (
              <div
                key={lesson.id}
                className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"
              >
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                <div className="flex-1">
                  <p className="font-semibold">{lesson.title}</p>
                  <Badge className={cn("mt-1", colors.bg, colors.text, "border", colors.border)}>
                    <Icon className="mr-1 h-3 w-3" />
                    {track?.name}
                  </Badge>
                </div>
                <Badge className="bg-green-100 text-green-800">Presente</Badge>
              </div>
            );
          }

          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  colors.bg
                )}
              >
                <Icon className={cn("h-5 w-5", colors.text)} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{lesson.title}</p>
                <Badge className={cn("mt-1", colors.bg, colors.text, "border", colors.border)}>
                  {track?.name}
                </Badge>
              </div>
              <KeyRound className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    );
  }

  // Step 2: Enter password
  const selected = lessons.find((l) => l.id === selectedLesson);
  const selectedTrack = selected?.course_tracks;
  const SelectedIcon = iconMap[selectedTrack?.icon || "book-open"] || BookOpen;
  const selectedColors = colorMap[selectedTrack?.color || "violet"] || colorMap.violet;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div
          className={cn(
            "mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl",
            selectedColors.bg
          )}
        >
          <SelectedIcon className={cn("h-7 w-7", selectedColors.text)} />
        </div>
        <CardTitle>{selected?.title}</CardTitle>
        <Badge className={cn("mx-auto mt-1", selectedColors.bg, selectedColors.text, "border", selectedColors.border)}>
          {selectedTrack?.name}
        </Badge>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-2 text-center text-sm text-muted-foreground">
              Digite a senha da aula:
            </p>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value.toUpperCase())}
              placeholder="Ex: BIBLIA24"
              className="h-14 rounded-xl text-center text-2xl font-bold uppercase tracking-[0.3em]"
              autoFocus
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedLesson(null);
                setPassword("");
              }}
              className="rounded-xl"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={!password.trim() || isPending}
              className="flex-1 rounded-xl shadow-lg shadow-primary/25"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Confirmar Presença"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
