"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") throw new Error("Não autorizado");
  return userId;
}

// ---- LESSONS ----

export async function createLesson(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("lessons").insert({
    week_number: Number(formData.get("week_number")),
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    date: formData.get("date") as string,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/aulas");
}

export async function updateLesson(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("lessons")
    .update({
      week_number: Number(formData.get("week_number")),
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      date: formData.get("date") as string,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/aulas");
}

export async function deleteLesson(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/aulas");
}

export async function setCheckinPassword(lessonId: string, password: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("lessons")
    .update({
      checkin_password: password.toUpperCase().trim(),
      checkin_open: true,
    })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/aulas/${lessonId}`);
  revalidatePath("/admin/aulas");
}

export async function closeCheckin(lessonId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("lessons")
    .update({
      checkin_open: false,
    })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/aulas/${lessonId}`);
  revalidatePath("/admin/aulas");
}

export async function openCheckin(lessonId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("lessons")
    .update({ checkin_open: true })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/aulas/${lessonId}`);
  revalidatePath("/admin/aulas");
}

// ---- TASKS ----

export async function createTask(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const lessonId = formData.get("lesson_id") as string;
  const { error } = await supabase.from("tasks").insert({
    lesson_id: lessonId || null,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tarefas");
}

export async function updateTask(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const lessonId = formData.get("lesson_id") as string;
  const { error } = await supabase
    .from("tasks")
    .update({
      lesson_id: lessonId || null,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      due_date: (formData.get("due_date") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tarefas");
}

export async function deleteTask(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tarefas");
}

// ---- NEWS ----

export async function createNews(formData: FormData) {
  const userId = await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("news").insert({
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    image_url: (formData.get("image_url") as string) || null,
    created_by: userId,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/noticias");
}

export async function deleteNews(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/noticias");
}
