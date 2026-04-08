import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import type { Lesson, Attendance } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AulasPage() {
  const { userId } = await auth();
  const supabase = createAdminClient();

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("clerk_id", userId!)
    .single();

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Seu cadastro esta sendo processado.
        </p>
      </div>
    );
  }

  const [lessonsRes, attendancesRes] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .order("week_number", { ascending: true }),
    supabase
      .from("attendances")
      .select("lesson_id")
      .eq("student_id", student.id),
  ]);

  const lessons = (lessonsRes.data as Lesson[] | null) ?? [];
  const attendedLessonIds = new Set(
    (attendancesRes.data as Pick<Attendance, "lesson_id">[] | null)?.map(
      (a) => a.lesson_id
    ) ?? []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Aulas</h1>
        <p className="text-muted-foreground">
          Acompanhe suas aulas e presencas.
        </p>
      </div>

      <div className="space-y-3">
        {lessons.map((lesson) => {
          const attended = attendedLessonIds.has(lesson.id);
          return (
            <Card key={lesson.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    Semana {lesson.week_number}: {lesson.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(lesson.date), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <Badge variant={attended ? "default" : "secondary"}>
                  {attended ? "Presente" : "Ausente"}
                </Badge>
              </CardHeader>
              {lesson.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {lesson.description}
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}

        {lessons.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            Nenhuma aula cadastrada ainda.
          </p>
        )}
      </div>
    </div>
  );
}
