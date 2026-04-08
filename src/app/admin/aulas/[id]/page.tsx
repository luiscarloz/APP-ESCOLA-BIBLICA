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
import type { Lesson, Student } from "@/lib/types";
import { CheckinPasswordSection } from "./checkin-qr";

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

  const { data: attendances } = await supabase
    .from("attendances")
    .select("id, checked_in_at, students(name, email)")
    .eq("lesson_id", id)
    .order("checked_in_at", { ascending: true });

  const typedLesson = lesson as Lesson;
  const typedAttendances = (attendances ?? []) as unknown as AttendanceWithStudent[];

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
            <CardTitle>Descricao</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{typedLesson.description}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      <CheckinPasswordSection lesson={typedLesson} />

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Presencas</CardTitle>
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
                  <TableHead>Horario</TableHead>
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
