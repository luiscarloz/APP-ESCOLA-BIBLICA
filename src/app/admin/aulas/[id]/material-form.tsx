"use client";

import { useState } from "react";
import { updateLessonMaterial } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import type { Lesson } from "@/lib/types";

export function MaterialForm({ lesson }: { lesson: Lesson }) {
  const [materialTitle, setMaterialTitle] = useState(
    lesson.material_title ?? ""
  );
  const [materialUrl, setMaterialUrl] = useState(lesson.material_url ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateLessonMaterial(lesson.id, materialUrl, materialTitle);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Erro ao salvar material.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Material da Aula
        </CardTitle>
        <CardDescription>
          Adicione um link para o material da aula (PDF, Google Drive, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {lesson.material_url && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {lesson.material_title || "Material da aula"}
              </p>
              <a
                href={lesson.material_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {lesson.material_url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="material_title">Título do Material</Label>
          <Input
            id="material_title"
            placeholder="Ex: Apostila - Semana 1"
            value={materialTitle}
            onChange={(e) => setMaterialTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="material_url">URL do Material</Label>
          <Input
            id="material_url"
            type="url"
            placeholder="https://drive.google.com/..."
            value={materialUrl}
            onChange={(e) => setMaterialUrl(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Material"}
        </Button>
      </CardContent>
    </Card>
  );
}
