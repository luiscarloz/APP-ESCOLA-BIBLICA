"use client";

import { useState } from "react";
import { setCheckinPassword, closeCheckin, openCheckin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, X, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import type { Lesson } from "@/lib/types";

export function CheckinPasswordSection({ lesson }: { lesson: Lesson }) {
  const [password, setPassword] = useState(lesson.checkin_password || "");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  async function handleSave() {
    if (!password.trim()) {
      toast.error("Digite uma senha.");
      return;
    }
    setSaving(true);
    try {
      await setCheckinPassword(lesson.id, password);
      toast.success("Senha salva e check-in aberto!");
    } catch {
      toast.error("Erro ao salvar senha.");
    } finally {
      setSaving(false);
    }
  }

  async function handleClose() {
    try {
      await closeCheckin(lesson.id);
      toast.success("Check-in fechado.");
    } catch {
      toast.error("Erro ao fechar check-in.");
    }
  }

  async function handleOpen() {
    if (!lesson.checkin_password && !password.trim()) {
      toast.error("Defina uma senha primeiro.");
      return;
    }
    try {
      if (password.trim() && password !== lesson.checkin_password) {
        await setCheckinPassword(lesson.id, password);
      } else {
        await openCheckin(lesson.id);
      }
      toast.success("Check-in aberto!");
    } catch {
      toast.error("Erro ao abrir check-in.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Check-in por Senha
            </CardTitle>
            <CardDescription>
              Defina a senha que os alunos digitam para confirmar presenca
            </CardDescription>
          </div>
          {lesson.checkin_open ? (
            <Badge className="bg-green-100 text-green-800">Aberto</Badge>
          ) : (
            <Badge variant="secondary">Fechado</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value.toUpperCase())}
              placeholder="Ex: BIBLIA24"
              className="h-12 pr-10 text-center text-xl font-bold tracking-[0.2em] uppercase rounded-xl"
              type={showPassword ? "text" : "password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Big display for projector */}
        {lesson.checkin_open && lesson.checkin_password && (
          <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Projete esta senha para os alunos:
            </p>
            <p className="text-5xl font-black tracking-[0.3em] text-primary">
              {lesson.checkin_password}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {lesson.checkin_open ? (
            <Button variant="destructive" onClick={handleClose} className="rounded-xl">
              <X className="mr-2 h-4 w-4" />
              Fechar Check-in
            </Button>
          ) : (
            <Button onClick={handleOpen} className="rounded-xl">
              <KeyRound className="mr-2 h-4 w-4" />
              Abrir Check-in
            </Button>
          )}
          <Button onClick={handleSave} variant="outline" disabled={saving} className="rounded-xl">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Salvando..." : "Salvar Senha"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
