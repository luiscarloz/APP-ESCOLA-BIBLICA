import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CalendarDays,
  BookOpen,
  Triangle,
  Globe,
  Landmark,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { NewsCard } from "@/components/news-card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getOrCreateStudentServer } from "@/lib/get-student";
import { getStudentTurma, getTurmaTrackIds } from "@/lib/get-turma";
import type { News, CourseTrack } from "@/lib/types";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ElementType> = {
  triangle: Triangle,
  globe: Globe,
  "book-open": BookOpen,
  landmark: Landmark,
};

const colorMap: Record<string, string> = {
  violet: "from-violet-500 to-violet-600",
  blue: "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-emerald-600",
  amber: "from-amber-500 to-amber-600",
};

const badgeColorMap: Record<string, string> = {
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default async function AlunoDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const student = await getOrCreateStudentServer();
  if (!student) redirect("/sign-in");

  // If preferences not set, redirect to choose
  if (!student.preferences_set) {
    redirect("/aluno/escolher-aula");
  }

  const supabase = createAdminClient();

  // Get turma info
  const turma = await getStudentTurma(student.id);
  const turmaTrackIds = turma ? await getTurmaTrackIds(turma) : [];

  // Get turma tracks details
  const turmaTracksRes = turmaTrackIds.length > 0
    ? await supabase
        .from("course_tracks")
        .select("id, name, color, icon")
        .in("id", turmaTrackIds)
    : { data: [] };

  const turmaTracks = (turmaTracksRes.data ?? []) as Pick<CourseTrack, "id" | "name" | "color" | "icon">[];

  const [newsRes, attendancesRes] = await Promise.all([
    supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(3),
    supabase.from("attendances").select("id").eq("student_id", student.id),
  ]);

  const recentNews = (newsRes.data as News[] | null) ?? [];
  const attendanceCount = attendancesRes.data?.length ?? 0;
  const progressPercent = Math.round((attendanceCount / 12) * 100);

  // Gradient based on turma
  const gradient = turma === 1 ? colorMap.violet : turma === 2 ? colorMap.emerald : colorMap.violet;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Olá, {student.name.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Bem-vindo à sua área do aluno.
        </p>
      </div>

      {/* Turma highlight card */}
      {turma && (
        <Card className="relative overflow-hidden border-0 text-white">
          <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_60%)]" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Sua Turma</p>
                <CardTitle className="text-2xl text-white">
                  Turma {turma}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-wrap gap-2">
              {turmaTracks.map((track) => {
                const TrackIcon = iconMap[track.icon || "book-open"] || BookOpen;
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm backdrop-blur-sm"
                  >
                    <TrackIcon className="h-4 w-4 shrink-0" />
                    <span>{track.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Presenças
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{attendanceCount}/12</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-chart-2/10" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Check-in
            </CardTitle>
            <QrCode className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Escaneie o QR Code durante a aula para registrar presença.
            </p>
            <Link
              href="/aluno/checkin"
              className={cn(buttonVariants({ size: "sm" }), "rounded-lg")}
            >
              Fazer Check-in
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent news */}
      {recentNews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Últimas Notícias</h2>
            <Link
              href="/aluno/noticias"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentNews.map((news) => (
              <NewsCard
                key={news.id}
                title={news.title}
                content={news.content}
                published_at={news.published_at}
                image_url={news.image_url}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
