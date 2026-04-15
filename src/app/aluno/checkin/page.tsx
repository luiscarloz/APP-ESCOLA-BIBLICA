import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateStudentServer } from "@/lib/get-student";
import { getStudentTurma, getTurmaTrackIds } from "@/lib/get-turma";
import type { LessonWithTrack } from "@/lib/types";
import { CheckinForm } from "./checkin-form";

export const dynamic = "force-dynamic";

export default async function CheckinPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const student = await getOrCreateStudentServer();
  if (!student) redirect("/sign-in");

  const turma = await getStudentTurma(student.id);
  if (!turma) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Defina suas preferências primeiro.
      </div>
    );
  }

  const trackIds = await getTurmaTrackIds(turma);
  const supabase = createAdminClient();

  // Get open lessons for this student's turma
  const { data: openLessons } = await supabase
    .from("lessons")
    .select("id, title, week_number, checkin_open, track_id, course_tracks(name, color, icon)")
    .eq("checkin_open", true)
    .in("track_id", trackIds)
    .order("week_number");

  // Get already checked-in lesson ids
  const { data: attendances } = await supabase
    .from("attendances")
    .select("lesson_id")
    .eq("student_id", student.id);

  const checkedInIds = new Set(
    (attendances ?? []).map((a: { lesson_id: string }) => a.lesson_id)
  );

  const lessons = ((openLessons ?? []) as unknown as LessonWithTrack[]).map((l) => ({
    ...l,
    alreadyCheckedIn: checkedInIds.has(l.id),
  }));

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Check-in de Presença
        </h1>
        <p className="mt-2 text-muted-foreground">
          Selecione a aula e digite a senha para registrar sua presença.
        </p>
      </div>

      <CheckinForm lessons={lessons} turma={turma} />
    </div>
  );
}
