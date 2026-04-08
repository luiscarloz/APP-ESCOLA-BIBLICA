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

      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        {[
          { n: "1", label: "Veja a senha" },
          { n: "2", label: "Digite aqui" },
          { n: "3", label: "Pronto!" },
        ].map((step) => (
          <div key={step.n} className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {step.n}
            </div>
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}
