"use client";

import { useRouter } from "next/navigation";
import { createNews } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NovaNoticiaPage() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    await createNews(formData);
    router.push("/admin/noticias");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/noticias">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nova Notícia</h1>
          <p className="text-muted-foreground">
            Crie uma nova notícia para os alunos
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados da Notícia</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para criar uma nova notícia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                name="content"
                rows={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
              <Input
                id="image_url"
                name="image_url"
                type="url"
                placeholder="https://..."
              />
            </div>
            <Button type="submit" className="w-full">
              Publicar Notícia
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
