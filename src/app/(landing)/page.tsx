import Link from "next/link";
import {
  BarChart2,
  Clock3,
  Globe,
  MessagesSquare,
  Smartphone,
} from "lucide-react";
import { redirect } from "next/navigation";

import AuthControls from "@/components/auth/AuthControls";
import { getCurrentUser } from "@/lib/currentUser";
import Image from "next/image";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/inicio");
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#040535]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-[1.3rem] bg-linear-to-br from-[#2ae5dc] via-[#0f3994] to-[#4740ff] shadow-[0_8px_24px_rgba(42,229,220,0.22)]">
              <MessagesSquare className="size-4.5 text-white" />
            </div>
            <span className="font-heading text-base font-semibold text-white">
              Inspira Updates
            </span>
          </Link>
          <AuthControls isAuthenticated={false} />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
        {/* Left */}
        <div className="space-y-8 lg:flex lg:flex-col lg:items-center lg:text-center">
          <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-white lg:text-6xl">
            Programa tus mensajes en{" "}
            <span className="text-[#2ae5dc]">WhatsApp</span>
          </h1>

          <p className="text-xl leading-9 text-slate-400">
            Conecta tu número, organiza tus grupos y programa mensajes con
            contexto completo. Una solución confiable para la comunicación
            profesional.
          </p>

          {/* 3-step numbered flow */}
          <div className="flex items-start">
            {[
              { num: "1", label: "Conecta", desc: "Escanea el código QR." },
              {
                num: "2",
                label: "Organiza",
                desc: "Guarda tus grupos destino.",
              },
              {
                num: "3",
                label: "Programa",
                desc: "Define el mensaje y hora.",
              },
            ].map((step, i) => (
              <div key={step.num} className="flex flex-1 items-start">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex size-10 items-center justify-center rounded-full border border-[#2ae5dc]/40 bg-[#2ae5dc]/10 text-sm font-bold text-[#2ae5dc]">
                    {step.num}
                  </div>
                  <p className="text-base font-semibold text-white">
                    {step.label}
                  </p>
                  <p className="max-w-22.5 text-sm leading-5 text-slate-400">
                    {step.desc}
                  </p>
                </div>
                {i < 2 && (
                  <div className="mt-5 flex-1 border-t border-dashed border-white/20" />
                )}
              </div>
            ))}
          </div>

          <AuthControls isAuthenticated={false} />
        </div>

        {/* Right */}
        <div className="relative flex flex-col gap-4">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(42,229,220,0.12),transparent_60%),radial-gradient(circle_at_80%_20%,rgba(71,64,255,0.18),transparent_50%)] blur-2xl" />
          <div className="relative h-105 overflow-hidden rounded-3xl lg:h-130">
            <Image
              src="/inspira-updates-hero.webp"
              alt="Vista previa de Inspira Updates"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 57vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: Smartphone,
              title: "Conexión guiada",
              desc: "Vincula tu WhatsApp en segundos con un código QR. Un proceso simple y directo para comenzar a operar.",
            },
            {
              icon: Clock3,
              title: "Programación clara",
              desc: "Define grupo, mensaje y fecha. Sin pasos innecesarios. Control total sobre tus envíos futuros.",
            },
            {
              icon: BarChart2,
              title: "Reportes en tiempo real",
              desc: "Mantén un seguimiento exhaustivo de tus campañas y el rendimiento de tus mensajes programados.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-white/8 bg-white/4 p-8"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-[#2ae5dc]">
                  <Icon className="size-7" />
                </div>
                <p className="mt-6 text-xl font-semibold text-white">
                  {item.title}
                </p>
                <p className="mt-3 text-base leading-7 text-slate-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-[#040535]/60">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-[1rem] bg-linear-to-br from-[#2ae5dc] via-[#0f3994] to-[#4740ff]">
                  <MessagesSquare className="size-4 text-white" />
                </div>
                <span className="font-heading text-sm font-semibold text-white">
                  Inspira Updates
                </span>
              </div>
              <p className="max-w-xs text-sm leading-6 text-slate-400">
                La herramienta profesional para potenciar tu comunicación en
                WhatsApp de manera programada y eficiente.
              </p>
              <Link
                href="#"
                className="inline-flex text-slate-400 transition-colors hover:text-white"
                aria-label="Redes sociales"
              >
                <Globe className="size-5" />
              </Link>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-white">Recursos</p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {["Sitio Web Oficial", "Cómo funciona", "Precios"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="transition-colors hover:text-white"
                      >
                        {item}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-white">Contacto</p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {["Soporte", "Términos y Condiciones"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="transition-colors hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/8 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-400">
              © 2025 Inspira Tech · Todos los derechos reservados
            </p>
            <p className="text-xs text-slate-400">
              Desarrollado por{" "}
              <span className="text-[#2ae5dc]">Mauro Quinteros</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
