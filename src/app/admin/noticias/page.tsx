"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteNews } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { News } from "@/lib/types";

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNews() {
    const res = await fetch("/api/admin/news");
    if (res.ok) {
      const data = await res.json();
      setNews(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNews();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta noticia?")) return;
    await deleteNews(id);
    fetchNews();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Noticias</h1>
          <p className="text-muted-foreground">
            Gerencie as noticias da Escola Biblica
          </p>
        </div>
        <Link href="/admin/noticias/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Noticia
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : news.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma noticia cadastrada.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>
                  {new Date(item.published_at).toLocaleDateString("pt-BR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {item.content}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
