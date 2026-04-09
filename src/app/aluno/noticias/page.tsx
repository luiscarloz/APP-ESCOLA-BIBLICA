import { createAdminClient } from "@/lib/supabase/admin";
import { Newspaper } from "lucide-react";
import { NewsCard } from "@/components/news-card";
import type { News } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const supabase = createAdminClient();

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  const newsList = (news as News[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notícias</h1>
        <p className="text-muted-foreground">
          Fique por dentro das novidades da Escola Bíblica.
        </p>
      </div>

      {newsList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((item) => (
            <NewsCard
              key={item.id}
              title={item.title}
              content={item.content}
              published_at={item.published_at}
              image_url={item.image_url}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Newspaper className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Nenhuma notícia publicada ainda.
          </p>
        </div>
      )}
    </div>
  );
}
