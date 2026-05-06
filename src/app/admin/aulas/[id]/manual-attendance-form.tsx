"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { markLessonAttendance } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isPending, startTransition] = useTransition();

  const attendedSet = useMemo(
    () => new Set(attendedStudentIds),
    [attendedStudentIds]
  );
  const availableStudents = students.filter(
    (student) => !attendedSet.has(student.id)
  );
  const filteredStudents = availableStudents.filter((student) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;

    return `${student.name} ${student.email}`.toLowerCase().includes(term);
  });
  const selectedStudent = availableStudents.find(
    (student) => student.id === studentId
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
        setSearch("");
        setShowResults(false);
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
          <div className="relative">
            <Input
              id="manual-attendance-student"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setStudentId("");
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Digite nome ou e-mail do aluno"
              autoComplete="off"
              role="combobox"
              aria-expanded={showResults}
              aria-controls="manual-attendance-results"
            />
            {showResults && (
              <div
                id="manual-attendance-results"
                className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-md"
              >
                {filteredStudents.length === 0 ? (
                  <p className="px-3 py-2 text-muted-foreground">
                    Nenhum aluno encontrado.
                  </p>
                ) : (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className="flex w-full flex-col rounded-md px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setStudentId(student.id);
                        setSearch(`${student.name} (${student.email})`);
                        setShowResults(false);
                      }}
                    >
                      <span className="font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {student.email}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {selectedStudent && (
            <p className="text-xs text-muted-foreground">
              Selecionado: {selectedStudent.name}
            </p>
          )}
        </div>
        <Button type="button" onClick={handleSubmit} disabled={isPending || !studentId}>
          <UserCheck className="mr-2 h-4 w-4" />
          {isPending ? "Registrando..." : "Registrar presença"}
        </Button>
      </div>
    </div>
  );
}
