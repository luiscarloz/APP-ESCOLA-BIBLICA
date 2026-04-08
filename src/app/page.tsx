import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { GraduationCap, KeyRound, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    try {
      const user = await currentUser();
      const role = user?.publicMetadata?.role as string | undefined;
      if (role === "admin") {
        redirect("/admin");
      }
    } catch {
      // Clerk session not fully ready yet, continue to /aluno
    }
    redirect("/aluno");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden px-6 py-20">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 text-center">
          <Image
            src="/logo.png"
            alt="Escola Biblica IIR"
            width={200}
            height={200}
            className="h-32 w-auto object-contain"
            priority
          />
          <div className="space-y-3">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              Escola{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Biblica
              </span>
            </h1>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground">
              12 semanas de aprendizado, comunhao e crescimento espiritual.
              Acompanhe suas aulas, tarefas e presenca em um so lugar.
            </p>
          </div>
        </div>

        <div className="relative flex gap-4">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-xl px-8 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            )}
          >
            Entrar
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-xl px-8"
            )}
          >
            Criar Conta
          </Link>
        </div>

        {/* Feature cards */}
        <div className="relative mt-8 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: KeyRound,
              title: "Check-in por Senha",
              desc: "Registre sua presenca com a senha da aula.",
            },
            {
              icon: ClipboardCheck,
              title: "Tarefas Online",
              desc: "Envie suas tarefas e acompanhe o progresso.",
            },
            {
              icon: GraduationCap,
              title: "Certificado",
              desc: "Receba seu certificado ao completar o curso.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
