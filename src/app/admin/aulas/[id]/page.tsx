import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import type { Lesson, Task, Student } from "@/lib/types";
import { CheckinPasswordSection } from "./checkin-qr";
import { MaterialForm } from "./material-form";
import { LessonTasks } from "./lesson-tasks";

export const dynamic = "force-dynamic";

interface AttendanceWithStudent {
  id: string;
  checked_in_at: string;
  students: Pick<Student, "name" | "email">;
}

export default async function AulaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (!lesson) notFound();

  const [attendancesRes, tasksRes] = await Promise.all([
    supabase
      .from("attendances")
      .select("id, checked_in_at, students(name, email)")
      .eq("lesson_id", id)
      .order("checked_in_at", { ascending: true }),
    supabase
      .from("tasks")
      .select("*")
      .eq("lesson_id", id)
      .order("created_at"),
  ]);

  const typedLesson = lesson as Lesson;
  const typedAttendances = (attendancesRes.data ?? []) as unknown as AttendanceWithStudent[];
  const lessonTasks = (tasksRes.data ?? []) as Task[];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/aulas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{typedLesson.title}</h1>
          <p className="text-muted-foreground">
            Semana {typedLesson.week_number} &mdash; {typedLesson.date}
          </p>
        </div>
      </div>

      {typedLesson.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{typedLesson.description}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <CheckinPasswordSection lesson={typedLesson} />

      <Separator />

      <MaterialForm lesson={typedLesson} />

      <Separator />

      <LessonTasks lessonId={id} lessonTitle={typedLesson.title} tasks={lessonTasks} />

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Presenças</CardTitle>
          <CardDescription>
            {typedAttendances.length} aluno(s) presente(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typedAttendances.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum aluno fez check-in nesta aula.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Horário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typedAttendances.map((att) => (
                  <TableRow key={att.id}>
                    <TableCell className="font-medium">
                      {att.students.name}
                    </TableCell>
                    <TableCell>{att.students.email}</TableCell>
                    <TableCell>
                      {new Date(att.checked_in_at).toLocaleTimeString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
