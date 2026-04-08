"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getOrCreateStudent() {
  const { userId } = await auth();
  if (!userId) throw new Error("Nao autenticado");

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("students")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (existing) return existing;

  const user = await currentUser();
  if (!user) throw new Error("Usuario nao encontrado");

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
    return { success: false, message: "Voce nao pode mais alterar suas preferencias." };
  }

  if (trackIds.length !== 4) {
    return { success: false, message: "Voce precisa ordenar todas as 4 aulas." };
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
  return { success: true, message: "Preferencias salvas com sucesso!" };
}

export async function performCheckin(password: string) {
  const student = await getOrCreateStudent();
  const supabase = createAdminClient();

  // Find open lesson with matching password
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("checkin_password", password.toUpperCase().trim())
    .eq("checkin_open", true)
    .single();

  if (!lesson) {
    return {
      success: false,
      message: "Senha incorreta ou check-in fechado para esta aula.",
    };
  }

  // Check if already checked in
  const { data: existing } = await supabase
    .from("attendances")
    .select("id")
    .eq("student_id", student.id)
    .eq("lesson_id", lesson.id)
    .single();

  if (existing) {
    return {
      success: true,
      message: `Voce ja fez check-in na aula: ${lesson.title}`,
    };
  }

  const { error } = await supabase.from("attendances").insert({
    student_id: student.id,
    lesson_id: lesson.id,
  });

  if (error) {
    return { success: false, message: "Erro ao registrar presenca." };
  }

  revalidatePath("/aluno");
  return { success: true, message: `Check-in realizado! Aula: ${lesson.title}` };
}

export async function submitTask(taskId: string, formData: FormData) {
  const student = await getOrCreateStudent();
  const supabase = createAdminClient();

  const content = formData.get("content") as string;
  const fileUrl = (formData.get("file_url") as string) || null;

  const { error } = await supabase.from("task_submissions").upsert(
    {
      task_id: taskId,
      student_id: student.id,
      content: content || null,
      file_url: fileUrl,
    },
    { onConflict: "task_id,student_id" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/aluno/tarefas");
}
