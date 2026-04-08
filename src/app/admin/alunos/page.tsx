import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Triangle, Globe, BookOpen, Landmark, Users } from "lucide-react";
import type { CourseTrack, Student } from "@/lib/types";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ElementType> = {
  triangle: Triangle,
  globe: Globe,
  "book-open": BookOpen,
  landmark: Landmark,
};

const colorMap: Record<string, { bg: string; text: string }> = {
  violet: { bg: "bg-violet-50", text: "text-violet-700" },
  blue: { bg: "bg-blue-50", text: "text-blue-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-700" },
};

export default async function AlunosPage() {
  const supabase = createAdminClient();

  const [studentsRes, tracksRes, prefsRes, attendancesRes] = await Promise.all([
    supabase.from("students").select("*").order("name"),
    supabase.from("course_tracks").select("*").order("created_at"),
    supabase
      .from("student_track_preferences")
      .select("student_id, track_id, priority")
      .order("priority"),
    supabase.from("attendances").select("student_id"),
  ]);

  const students = (studentsRes.data ?? []) as Student[];
  const tracks = (tracksRes.data ?? []) as CourseTrack[];
  const prefs = (prefsRes.data ?? []) as {
    student_id: string;
    track_id: string;
    priority: number;
  }[];

  // Attendance counts
  const attendanceCounts: Record<string, number> = {};
  (attendancesRes.data ?? []).forEach((att: { student_id: string }) => {
    attendanceCounts[att.student_id] =
      (attendanceCounts[att.student_id] || 0) + 1;
  });

  // Build student preference map: student_id -> ordered track_ids
  const studentPrefs = new Map<string, string[]>();
  prefs.forEach((p) => {
    if (!studentPrefs.has(p.student_id)) studentPrefs.set(p.student_id, []);
    studentPrefs.get(p.student_id)!.push(p.track_id);
  });

  // Group students by their 1st choice track
  const studentsByFirstChoice = new Map<string | null, Student[]>();
  studentsByFirstChoice.set(null, []);
  tracks.forEach((t) => studentsByFirstChoice.set(t.id, []));

  students.forEach((s) => {
    const firstChoice = studentPrefs.get(s.id)?.[0] ?? null;
    const list =
      studentsByFirstChoice.get(firstChoice) ??
      studentsByFirstChoice.get(null)!;
    list.push(s);
  });

  const noPrefs = studentsByFirstChoice.get(null) ?? [];

  // Track name lookup
  const trackMap = new Map(tracks.map((t) => [t.id, t]));

  function getStudentPrefsDisplay(studentId: string) {
    const order = studentPrefs.get(studentId);
    if (!order) return null;
    return order.map((tid, i) => {
      const t = trackMap.get(tid);
      return t ? `${i + 1}. ${t.name}` : null;
    }).filter(Boolean);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Alunos</h1>
        <p className="mt-1 text-muted-foreground">
          {students.length} aluno{students.length !== 1 ? "s" : ""} cadastrado
          {students.length !== 1 ? "s" : ""} — agrupados por 1a preferencia
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tracks.map((track) => {
          const Icon = iconMap[track.icon || "book-open"] || BookOpen;
          const colors = colorMap[track.color || "violet"] || colorMap.violet;
          const count = studentsByFirstChoice.get(track.id)?.length ?? 0;

          return (
            <Card key={track.id} className="relative overflow-hidden">
              <div
                className={`absolute top-0 right-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full ${colors.bg}`}
              />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {track.name}
                </CardTitle>
                <div className={`rounded-lg p-1.5 ${colors.bg}`}>
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  1a opcao
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Students by track (1st choice) */}
      {tracks.map((track) => {
        const trackStudents = studentsByFirstChoice.get(track.id) ?? [];
        const colors = colorMap[track.color || "violet"] || colorMap.violet;
        const Icon = iconMap[track.icon || "book-open"] || BookOpen;

        return (
          <Card key={track.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`rounded-lg p-1.5 ${colors.bg}`}>
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
                {track.name}
                <Badge variant="secondary" className="ml-auto">
                  {trackStudents.length} aluno
                  {trackStudents.length !== 1 ? "s" : ""}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trackStudents.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nenhum aluno com esta 1a opcao ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Preferencias</TableHead>
                      <TableHead>Presencas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trackStudents.map((student) => {
                      const prefsDisplay = getStudentPrefsDisplay(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.name}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            {prefsDisplay ? (
                              <div className="flex flex-wrap gap-1">
                                {prefsDisplay.map((p, i) => (
                                  <span
                                    key={i}
                                    className={`inline-block rounded-md px-2 py-0.5 text-xs ${
                                      i === 0
                                        ? "bg-primary/10 font-medium text-primary"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Nao definidas
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {attendanceCounts[student.id] ?? 0}/12
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Students without preferences */}
      {noPrefs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-muted p-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              Sem preferencias
              <Badge variant="secondary" className="ml-auto">
                {noPrefs.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noPrefs.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
