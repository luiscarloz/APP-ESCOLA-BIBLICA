import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardList, CalendarDays } from "lucide-react";
import type { CourseTrack } from "@/lib/types";
import { PreferenceCharts } from "./preference-charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [studentsRes, lessonsRes, tasksRes, attendancesRes, tracksRes, prefsRes] =
    await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("lessons").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }),
      supabase.from("attendances").select("id", { count: "exact", head: true }),
      supabase.from("course_tracks").select("*").order("created_at"),
      supabase.from("student_track_preferences").select("track_id, priority"),
    ]);

  const tracks = (tracksRes.data ?? []) as CourseTrack[];
  const prefs = (prefsRes.data ?? []) as { track_id: string; priority: number }[];

  // Build chart data: for each priority level, count per track
  const chartData = tracks.map((track) => {
    const counts: Record<string, number> = { name: 0 } as any;
    for (let p = 1; p <= 4; p++) {
      counts[`p${p}`] = prefs.filter(
        (pref) => pref.track_id === track.id && pref.priority === p
      ).length;
    }
    return {
      name: track.name,
      color: track.color || "violet",
      "1a Opção": counts.p1,
      "2a Opção": counts.p2,
      "3a Opção": counts.p3,
      "4a Opção": counts.p4,
    };
  });

  // Pie data: just 1st choice distribution
  const pieData = tracks.map((track) => ({
    name: track.name,
    value: prefs.filter((p) => p.track_id === track.id && p.priority === 1).length,
    color: track.color || "violet",
  }));

  const stats = [
    {
      title: "Alunos",
      value: studentsRes.count ?? 0,
      desc: "cadastrados",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Aulas",
      value: lessonsRes.count ?? 0,
      desc: "criadas",
      icon: BookOpen,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
    },
    {
      title: "Tarefas",
      value: tasksRes.count ?? 0,
      desc: "criadas",
      icon: ClipboardList,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
    },
    {
      title: "Presenças",
      value: attendancesRes.count ?? 0,
      desc: "check-ins",
      icon: CalendarDays,
      color: "text-chart-4",
      bg: "bg-chart-4/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral da Escola Bíblica
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-4 -translate-y-4 rounded-full bg-primary/5" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <PreferenceCharts pieData={pieData} barData={chartData} />
    </div>
  );
}
