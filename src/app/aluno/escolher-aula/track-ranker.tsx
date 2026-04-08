"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePreferences } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import {
  Triangle,
  Globe,
  BookOpen,
  Landmark,
  Loader2,
  RotateCcw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CourseTrack } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  triangle: Triangle,
  globe: Globe,
  "book-open": BookOpen,
  landmark: Landmark,
};

const colorConfig: Record<
  string,
  { bg: string; border: string; text: string; number: string; light: string }
> = {
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-700",
    number: "bg-violet-600 text-white",
    light: "bg-violet-100",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    number: "bg-blue-600 text-white",
    light: "bg-blue-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    number: "bg-emerald-600 text-white",
    light: "bg-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    number: "bg-amber-600 text-white",
    light: "bg-amber-100",
  },
};

const priorityLabels = ["1a Opcao", "2a Opcao", "3a Opcao", "4a Opcao"];

export function TrackRanker({
  tracks,
  existingOrder,
}: {
  tracks: CourseTrack[];
  existingOrder: string[];
}) {
  // If there's an existing order, use it. Otherwise empty.
  const [ranked, setRanked] = useState<string[]>(
    existingOrder.length === 4 ? existingOrder : []
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const unranked = tracks.filter((t) => !ranked.includes(t.id));
  const rankedTracks = ranked
    .map((id) => tracks.find((t) => t.id === id)!)
    .filter(Boolean);

  function handleClick(trackId: string) {
    if (ranked.includes(trackId)) return;
    setRanked((prev) => [...prev, trackId]);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setRanked((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function handleMoveDown(index: number) {
    if (index >= ranked.length - 1) return;
    setRanked((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function handleReset() {
    setRanked([]);
  }

  function handleConfirm() {
    if (ranked.length !== 4) return;
    startTransition(async () => {
      const result = await savePreferences(ranked);
      if (result.success) {
        toast.success(result.message);
        router.push("/aluno");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Ranked list */}
      {rankedTracks.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Sua ordem de preferencia:
          </p>
          <div className="space-y-2">
            {rankedTracks.map((track, i) => {
              const colors =
                colorConfig[track.color || "violet"] || colorConfig.violet;
              const Icon = iconMap[track.icon || "book-open"] || BookOpen;

              return (
                <div
                  key={track.id}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border-2 p-4 transition-all",
                    colors.border,
                    colors.bg
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                      colors.number
                    )}
                  >
                    {i + 1}
                  </div>
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      colors.light
                    )}
                  >
                    <Icon className={cn("h-5 w-5", colors.text)} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{track.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {priorityLabels[i]}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveUp(i)}
                      disabled={i === 0}
                      className="rounded-lg p-1.5 transition-colors hover:bg-black/5 disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(i)}
                      disabled={i === rankedTracks.length - 1}
                      className="rounded-lg p-1.5 transition-colors hover:bg-black/5 disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unranked options */}
      {unranked.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            {ranked.length === 0
              ? "Clique na sua 1a opcao:"
              : `Clique na sua ${ranked.length + 1}a opcao:`}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {unranked.map((track) => {
              const colors =
                colorConfig[track.color || "violet"] || colorConfig.violet;
              const Icon = iconMap[track.icon || "book-open"] || BookOpen;

              return (
                <button
                  key={track.id}
                  onClick={() => handleClick(track.id)}
                  className="group flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 text-left transition-all duration-200 hover:border-muted-foreground/30 hover:shadow-lg active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold">{track.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {track.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        {ranked.length > 0 && (
          <Button variant="outline" onClick={handleReset} className="rounded-xl">
            <RotateCcw className="mr-2 h-4 w-4" />
            Recomecar
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          disabled={ranked.length !== 4 || isPending}
          size="lg"
          className="rounded-xl px-10 shadow-lg shadow-primary/25"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Confirmar Preferencias"
          )}
        </Button>
      </div>
    </div>
  );
}
