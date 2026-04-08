"use client";

import { useState, useTransition } from "react";
import { performCheckin } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Loader2,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export function CheckinForm() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    startTransition(async () => {
      const res = await performCheckin(password);
      setResult(res);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  }

  if (result) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div
          className={`flex h-28 w-28 items-center justify-center rounded-full ${
            result.success
              ? "bg-gradient-to-br from-green-100 to-green-50"
              : "bg-gradient-to-br from-red-100 to-red-50"
          }`}
        >
          {result.success ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive" />
          )}
        </div>
        <Card className="w-full text-center">
          <CardHeader>
            <CardTitle className="text-xl">
              {result.success ? "Check-in Realizado!" : "Erro no Check-in"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{result.message}</p>
            {!result.success && (
              <Button
                onClick={() => {
                  setResult(null);
                  setPassword("");
                }}
                variant="outline"
                className="rounded-xl"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
        <CardTitle>Digite a Senha da Aula</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value.toUpperCase())}
            placeholder="Ex: BIBLIA24"
            className="h-14 text-center text-2xl font-bold tracking-[0.3em] uppercase rounded-xl"
            autoFocus
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={!password.trim() || isPending}
            size="lg"
            className="w-full rounded-xl shadow-lg shadow-primary/25"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Confirmar Presenca"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
