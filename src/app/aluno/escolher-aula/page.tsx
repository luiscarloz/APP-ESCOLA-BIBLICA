import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { getOrCreateStudentServer } from "@/lib/get-student";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { CourseTrack } from "@/lib/types";
import { TrackRanker } from "./track-ranker";

export const dynamic = "force-dynamic";

export default async function EscolherAulaPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const student = await getOrCreateStudentServer();
  if (!student) redirect("/sign-in");

  // If already set and can't change, go to dashboard
  if (student.preferences_set && !student.can_change_preferences) {
    redirect("/aluno");
  }

  const supabase = createAdminClient();

  const [tracksRes, prefsRes] = await Promise.all([
    supabase.from("course_tracks").select("*").order("created_at"),
    supabase
      .from("student_track_preferences")
      .select("track_id, priority")
      .eq("student_id", student.id)
      .order("priority"),
  ]);

  const tracks = (tracksRes.data as CourseTrack[]) ?? [];
  const existingOrder = (prefsRes.data ?? []).map(
    (p: { track_id: string }) => p.track_id
  );

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ordene suas{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Preferências
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Clique nas aulas na ordem de sua preferência: da mais desejada para
            a menos desejada.
          </p>
          {student.preferences_set && student.can_change_preferences && (
            <p className="mt-2 text-sm text-amber-600">
              Você já ordenou suas preferências, mas ainda pode alterar.
            </p>
          )}
        </div>

        {!student.preferences_set && (
          <Card className="border-amber-200 bg-amber-50 text-amber-950">
            <CardContent className="flex gap-3 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold">
                  Esta parece ser uma conta nova.
                </p>
                <p>
                  Se você já participou de outras aulas e está sem histórico,
                  tente entrar pela mesma conta que usou na primeira vez.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <TrackRanker tracks={tracks} existingOrder={existingOrder} />
      </div>
    </div>
  );
}
