import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getOrCreateStudentServer() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("students")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (existing) return existing;

  // Auto-create student from Clerk data
  let user;
  try {
    user = await currentUser();
  } catch {
    return null;
  }
  if (!user) return null;

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
    // Might be a race condition / duplicate — try fetching again
    const { data: retry } = await supabase
      .from("students")
      .select("*")
      .eq("clerk_id", userId)
      .single();
    if (retry) return retry;
    return null;
  }

  return created;
}
