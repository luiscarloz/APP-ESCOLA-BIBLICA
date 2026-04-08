import { CheckinForm } from "./checkin-form";

export const dynamic = "force-dynamic";

export default function CheckinPage() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Check-in de Presenca
        </h1>
        <p className="mt-2 text-muted-foreground">
          Digite a senha exibida pelo professor para registrar sua presenca.
        </p>
      </div>

      <CheckinForm />

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            1
          </div>
          Veja a senha no telao
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            2
          </div>
          Digite aqui
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
