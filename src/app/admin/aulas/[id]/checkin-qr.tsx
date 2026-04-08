"use client";

import { useEffect, useRef, useState } from "react";
import { generateCheckinToken, closeCheckin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, X } from "lucide-react";
import QRCode from "qrcode";
import type { Lesson } from "@/lib/types";

export function CheckinQRSection({ lesson }: { lesson: Lesson }) {
  const [token, setToken] = useState<string | null>(lesson.checkin_token);
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (token && canvasRef.current) {
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/aluno/checkin?token=${token}`;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
      });
    }
  }, [token]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const newToken = await generateCheckinToken(lesson.id);
      setToken(newToken);
    } finally {
      setGenerating(false);
    }
  }

  async function handleClose() {
    await closeCheckin(lesson.id);
    setToken(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Check-in</CardTitle>
            <CardDescription>
              Gere um QR Code para os alunos registrarem presenca
            </CardDescription>
          </div>
          {token ? (
            <Badge>Aberto</Badge>
          ) : (
            <Badge variant="secondary">Fechado</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {token ? (
          <div className="flex flex-col items-center gap-4">
            <canvas ref={canvasRef} />
            <p className="text-sm text-muted-foreground text-center">
              Mostre este QR Code para os alunos escanearem.
            </p>
            <Button variant="destructive" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Fechar Check-in
            </Button>
          </div>
        ) : (
          <Button onClick={handleGenerate} disabled={generating}>
            <QrCode className="mr-2 h-4 w-4" />
            {generating ? "Gerando..." : "Gerar QR Code"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
