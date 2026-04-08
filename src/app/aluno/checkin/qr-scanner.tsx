"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { performCheckin } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export function QrScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function startScanner() {
    setResult(null);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Extract token from URL
          let token: string | null = null;
          try {
            const url = new URL(decodedText);
            token = url.searchParams.get("token");
          } catch {
            // Maybe it's just a token string
            token = decodedText;
          }

          if (token) {
            scanner.stop().catch(() => {});
            scannerRef.current = null;
            setScanning(false);

            startTransition(async () => {
              const res = await performCheckin(token!);
              setResult(res);
              if (res.success) {
                toast.success(res.message);
              } else {
                toast.error(res.message);
              }
            });
          }
        },
        () => {
          // QR not found in frame - ignore
        }
      );
    } catch (err: any) {
      setScanning(false);
      toast.error("Nao foi possivel acessar a camera. Verifique as permissoes.");
    }
  }

  function stopScanner() {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Show result
  if (result) {
    return (
      <div className="flex flex-col items-center gap-6">
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
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">
              {result.success ? "Check-in Realizado!" : "Erro no Check-in"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{result.message}</p>
            <Button
              onClick={() => {
                setResult(null);
              }}
              variant="outline"
              className="rounded-xl"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Escanear outro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Registrando presenca...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Scanner area */}
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border bg-black"
        style={{ minHeight: scanning ? 320 : 0 }}
      >
        <div id="qr-reader" ref={containerRef} />
      </div>

      {!scanning ? (
        <Button
          onClick={startScanner}
          size="lg"
          className="rounded-xl px-8 shadow-lg shadow-primary/25"
        >
          <Camera className="mr-2 h-5 w-5" />
          Abrir Camera
        </Button>
      ) : (
        <Button
          onClick={stopScanner}
          variant="outline"
          className="rounded-xl"
        >
          Fechar Camera
        </Button>
      )}
    </div>
  );
}
