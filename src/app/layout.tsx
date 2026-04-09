import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Escola Bíblica IIR",
  description:
    "Escola Bíblica IIR Brasil — Aulas, presença e acompanhamento do curso.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Escola Bíblica IIR Brasil",
    description: "12 semanas de aprendizado, comunhão e crescimento espiritual.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Escola Bíblica IIR Brasil",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Escola Bíblica IIR Brasil",
    description: "12 semanas de aprendizado, comunhão e crescimento espiritual.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html
        lang="pt-BR"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col overflow-x-hidden">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
