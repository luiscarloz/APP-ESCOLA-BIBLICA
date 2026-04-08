import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardList, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [studentsRes, lessonsRes, tasksRes, attendancesRes] =
    await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("lessons").select("id", { count: "exact", head: true }),
      supabase.from("tasks").select("id", { count: "exact", head: true }),
      supabase
        .from("attendances")
        .select("id", { count: "exact", head: true }),
    ]);

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
      title: "Presencas",
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
          Visao geral da Escola Biblica
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
    </div>
  );
}
