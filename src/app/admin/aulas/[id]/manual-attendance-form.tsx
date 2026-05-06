"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { markLessonAttendance } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import type { Student } from "@/lib/types";

export function ManualAttendanceForm({
  lessonId,
  students,
  attendedStudentIds,
}: {
  lessonId: string;
  students: Pick<Student, "id" | "name" | "email">[];
  attendedStudentIds: string[];
}) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [isPending, startTransition] = useTransition();

  const attendedSet = useMemo(
    () => new Set(attendedStudentIds),
    [attendedStudentIds]
  );
  const availableStudents = students.filter(
    (student) => !attendedSet.has(student.id)
  );

  function handleSubmit() {
    if (!studentId) {
      toast.error("Selecione um aluno.");
      return;
    }

    startTransition(async () => {
      try {
        await markLessonAttendance(lessonId, studentId);
        toast.success("Presença registrada.");
        setStudentId("");
        router.refresh();
      } catch {
        toast.error("Erro ao registrar presença.");
      }
    });
  }

  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum aluno cadastrado ainda.
      </p>
    );
  }

  if (availableStudents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todos os alunos cadastrados já têm presença nesta aula.
      </p>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="manual-attendance-student">Dar presença manual</Label>
          <select
            id="manual-attendance-student"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Selecione um aluno</option>
            {availableStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
        </div>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          <UserCheck className="mr-2 h-4 w-4" />
          {isPending ? "Registrando..." : "Registrar presença"}
        </Button>
      </div>
    </div>
  );
}
