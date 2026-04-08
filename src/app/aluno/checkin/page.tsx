import { CheckCircle, XCircle, QrCode, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { performCheckin } from "@/app/actions/student";

export const dynamic = "force-dynamic";

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-24">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5">
            <QrCode className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <Smartphone className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Check-in de Presenca
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Para registrar sua presenca, escaneie o QR Code exibido pelo
            professor durante a aula. Voce sera redirecionado automaticamente
            para esta pagina.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              1
            </div>
            Abra a camera
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              2
            </div>
            Escaneie o QR
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              3
            </div>
            Pronto!
          </div>
        </div>
      </div>
    );
  }

  const result = await performCheckin(token);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24">
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
          <CardTitle className="text-2xl">
            {result.success ? "Check-in Realizado!" : "Erro no Check-in"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{result.message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
