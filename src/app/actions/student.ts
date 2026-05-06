"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type CheckinLesson = {
  id: string;
  title: string;
  track_id: string | null;
  checkin_password: string | null;
  checkin_open: boolean;
  course_tracks: { name: string; turma: number | null } | null;
};

type PreferenceWithTrack = {
  course_tracks: { turma: number | null } | null;
};

export async function getOrCreateStudent() {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado");

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("students")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (existing) return existing;

  const user = await currentUser();
  if (!user) throw new Error("Usuário não encontrado");

  const { data: created, error } = await supabase
    .from("students")
    .insert({
      clerk_id: userId,
      name:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.emailAddresses[0]?.emailAddress ||
        "Aluno",
      email: user.emailAddresses[0]?.emailAddress || "",
      phone: user.phoneNumbers[0]?.phoneNumber || null,
    })
    .select("*")
    .single();

  if (error) {
    // Race condition — try fetching again
    const { data: retry } = await supabase
      .from("students")
      .select("*")
      .eq("clerk_id", userId)
      .single();
    if (retry) return retry;
    throw new Error(error.message);
  }
  return created!;
}

// trackIds ordered by priority: [0] = 1st choice, [1] = 2nd, etc.
export async function savePreferences(trackIds: string[]) {
  const student = await getOrCreateStudent();
  const supabase = createAdminClient();

  if (student.preferences_set && !student.can_change_preferences) {
    return { success: false, message: "Você não pode mais alterar suas preferências." };
  }

  if (trackIds.length !== 4) {
    return { success: false, message: "Você precisa ordenar todas as 4 aulas." };
  }

  // Delete existing preferences
  await supabase
    .from("student_track_preferences")
    .delete()
    .eq("student_id", student.id);

  // Insert new preferences
  const rows = trackIds.map((trackId, i) => ({
    student_id: student.id,
    track_id: trackId,
    priority: i + 1,
  }));

  const { error } = await supabase
    .from("student_track_preferences")
    .insert(rows);

  if (error) return { success: false, message: error.message };

  // Mark preferences as set
  await supabase
    .from("students")
    .update({ preferences_set: true })
    .eq("id", student.id);

  revalidatePath("/aluno");
  return { success: true, message: "Preferências salvas com sucesso!" };
}

export async function performCheckin(lessonId: string, password: string) {
  const student = await getOrCreateStudent();
  const supabase = createAdminClient();

  // Find the lesson and validate password
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, track_id, checkin_password, checkin_open, course_tracks(name, turma)")
    .eq("id", lessonId)
    .single();

  const checkinLesson = lesson as unknown as CheckinLesson | null;

  if (!checkinLesson) {
    return { success: false, message: "Aula não encontrada." };
  }

  if (!checkinLesson.checkin_open) {
    return { success: false, message: "O check-in desta aula está fechado." };
  }

  if (
    checkinLesson.checkin_password?.toUpperCase() !==
    password.toUpperCase().trim()
  ) {
    return { success: false, message: "Senha incorreta." };
  }

  // Validate turma — student can only check in to lessons of their turma
  const { data: pref } = await supabase
    .from("student_track_preferences")
    .select("track_id, course_tracks(turma)")
    .eq("student_id", student.id)
    .eq("priority", 1)
    .single();

  const preference = pref as unknown as PreferenceWithTrack | null;
  const studentTurma = preference?.course_tracks?.turma;
  const lessonTurma = checkinLesson.course_tracks?.turma;
  const lessonTrackName = checkinLesson.course_tracks?.name;

  if (studentTurma && lessonTurma && studentTurma !== lessonTurma) {
    // Get student's turma track names
    const { data: turmaTracksData } = await supabase
      .from("course_tracks")
      .select("name")
      .eq("turma", studentTurma);
    const turmaNames = (turmaTracksData ?? []).map((t: { name: string }) => t.name).join(" e ");

    return {
      success: false,
      message: `Esta aula é de ${lessonTrackName} e não faz parte da sua turma. Sua turma é a Turma ${studentTurma} (${turmaNames}).`,
    };
  }

  // Check if already checked in
  const { data: existing } = await supabase
    .from("attendances")
    .select("id")
    .eq("student_id", student.id)
    .eq("lesson_id", checkinLesson.id)
    .single();

  if (existing) {
    return {
      success: true,
      message: `Você já fez check-in na aula: ${checkinLesson.title}`,
    };
  }

  const { error } = await supabase.from("attendances").insert({
    student_id: student.id,
    lesson_id: checkinLesson.id,
  });

  if (error) {
    return { success: false, message: "Erro ao registrar presença." };
  }

  revalidatePath("/aluno");
  revalidatePath("/aluno/aulas");
  return {
    success: true,
    message: `Check-in realizado! Aula: ${checkinLesson.title}`,
  };
}

export async function submitTask(taskId: string, formData: FormData) {
  const student = await getOrCreateStudent();
  const supabase = createAdminClient();

  const content = ((formData.get("content") as string) || "").trim();
  const fileUrl = ((formData.get("file_url") as string) || "").trim();

  if (!content && !fileUrl) {
    return {
      success: false,
      message: "Escreva uma resposta ou adicione um link.",
    };
  }

  const { error } = await supabase.from("task_submissions").upsert(
    {
      task_id: taskId,
      student_id: student.id,
      content: content || null,
      file_url: fileUrl || null,
    },
    { onConflict: "task_id,student_id" }
  );

  if (error) {
    return {
      success: false,
      message: "Erro ao enviar tarefa. Tente novamente.",
    };
  }
  revalidatePath("/aluno/tarefas");
  revalidatePath("/aluno/aulas");
  return { success: true, message: "Tarefa enviada com sucesso!" };
}
