"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";

interface CertificateDownloadProps {
  studentName: string;
  completionDate: string;
}

export function CertificateDownload({
  studentName,
  completionDate,
}: CertificateDownloadProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      <div
        ref={certificateRef}
        className="relative mx-auto max-w-2xl rounded-lg border-4 border-double border-primary/30 bg-white p-12 text-center shadow-lg"
      >
        <div className="absolute inset-4 rounded border border-primary/10" />

        <Award className="mx-auto h-16 w-16 text-primary" />

        <h2 className="mt-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Certificado de Conclusao
        </h2>

        <h3 className="mt-2 text-lg font-semibold text-muted-foreground">
          Escola Biblica
        </h3>

        <p className="mt-6 text-sm text-muted-foreground">
          Certificamos que
        </p>

        <p className="mt-2 text-3xl font-bold text-foreground">
          {studentName}
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          concluiu com exito o curso da Escola Biblica, tendo cumprido todos os
          requisitos de presenca e participacao.
        </p>

        <p className="mt-8 text-sm text-muted-foreground">
          {completionDate}
        </p>

        <div className="mt-8 flex justify-center">
          <div className="w-48 border-t border-muted-foreground/30 pt-2">
            <p className="text-xs text-muted-foreground">
              Igreja Internacional da Restauracao
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => {
            if (certificateRef.current) {
              window.print();
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar Certificado
        </Button>
      </div>
    </div>
  );
}
