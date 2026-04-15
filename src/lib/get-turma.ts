import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Retorna o número da turma do aluno (1 ou 2) com base na 1a preferência.
 * Turma 1: Trindade, Cosmovisão Bíblica
 * Turma 2: Introdução Bíblica, História da Igreja
 */
export async function getStudentTurma(studentId: string): Promise<number | null> {
  const supabase = createAdminClient();

  const { data: pref } = await supabase
    .from("student_track_preferences")
    .select("track_id, course_tracks(turma)")
    .eq("student_id", studentId)
    .eq("priority", 1)
    .single();

  if (!pref) return null;
  return (pref as any).course_tracks?.turma ?? null;
}

/**
 * Retorna os track_ids da turma do aluno.
 */
export async function getTurmaTrackIds(turma: number): Promise<string[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("course_tracks")
    .select("id")
    .eq("turma", turma);

  return (data ?? []).map((t: { id: string }) => t.id);
}
