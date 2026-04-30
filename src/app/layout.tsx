import "@/lib/env";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspira Updates",
  description: "Programa y supervisa mensajes de WhatsApp con un espacio de trabajo claro y elegante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
