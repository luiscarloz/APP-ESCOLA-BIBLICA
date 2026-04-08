import { createAdminClient } from "@/lib/supabase/admin";
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
import { Award } from "lucide-react";
import type { Student } from "@/lib/types";

export const dynamic = "force-dynamic";

const MINIMUM_ATTENDANCES = 10;
const TOTAL_LESSONS = 12;

export default async function CertificadosPage() {
  const supabase = createAdminClient();

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("name");

  const { data: attendances } = await supabase
    .from("attendances")
    .select("student_id");

  const typedStudents = (students ?? []) as Student[];
  const attendanceCounts: Record<string, number> = {};
  (attendances ?? []).forEach((att: { student_id: string }) => {
    attendanceCounts[att.student_id] =
      (attendanceCounts[att.student_id] || 0) + 1;
  });

  const eligibleStudents = typedStudents.filter(
    (s) => (attendanceCounts[s.id] ?? 0) >= MINIMUM_ATTENDANCES
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Certificados</h1>
        <p className="text-muted-foreground">
          Alunos elegiveis para certificado ({MINIMUM_ATTENDANCES}+ presencas de{" "}
          {TOTAL_LESSONS} aulas)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <div>
              <CardTitle>Alunos Elegiveis</CardTitle>
              <CardDescription>
                {eligibleStudents.length} aluno(s) elegivel(is) para certificado
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {eligibleStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum aluno atingiu o minimo de {MINIMUM_ATTENDANCES} presencas
              ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Presencas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligibleStudents.map((student) => {
                  const count = attendanceCounts[student.id] ?? 0;
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {count}/{TOTAL_LESSONS}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {count >= TOTAL_LESSONS ? (
                          <Badge>Completo</Badge>
                        ) : (
                          <Badge variant="secondary">Elegivel</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
