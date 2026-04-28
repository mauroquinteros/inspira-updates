import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";

import AuthControls from "@/components/auth/AuthControls";
import AppSidebarNav from "@/components/layout/AppSidebarNav";

interface AppShellProps {
  userEmail?: string;
  children: React.ReactNode;
}

export default function AppShell({ userEmail, children }: AppShellProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="border-b border-white/8 bg-[#090d3f]/82 px-5 py-6 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-stretch">
          <div className="space-y-5">
            <Link href="/inicio" className="inline-flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-[#2ae5dc] via-[#0f3994] to-[#4740ff] shadow-[0_14px_40px_rgba(42,229,220,0.28)]">
                <Sparkles className="size-5 text-white" />
              </div>
              <div>
                <p className="font-heading text-lg font-semibold tracking-tight text-white">Inspira Updates</p>
                <p className="text-xs text-slate-400">Centro de control para tus anuncios</p>
              </div>
            </Link>

            <div className="hidden rounded-[1.6rem] border border-white/8 bg-white/4 p-4 lg:block">
              <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-400">Espacio de trabajo</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Visualiza el estado de WhatsApp, programa mensajes y mantén tus grupos listos sin perder contexto.
              </p>
            </div>
          </div>

          <div className="lg:hidden">
            <AuthControls isAuthenticated userEmail={userEmail} compact />
          </div>
        </div>

        <div className="mt-6 space-y-6 lg:mt-10">
          <AppSidebarNav />

          <div className="hidden rounded-[1.6rem] border border-[#2ae5dc]/15 bg-gradient-to-br from-[#0f3994]/35 via-[#4740ff]/14 to-transparent p-4 lg:block">
            <div className="flex items-center gap-2 text-[#2ae5dc]">
              <Zap className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em]">Flujo recomendado</p>
            </div>
            <ol className="mt-3 space-y-2 text-sm text-slate-200">
              <li>1. Conecta tu sesión de WhatsApp.</li>
              <li>2. Guarda o activa tus grupos.</li>
              <li>3. Programa el siguiente envío.</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 hidden lg:block">
          <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-4">
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-400">Cuenta</p>
            <p className="mt-2 truncate text-sm text-slate-200">{userEmail ?? "Sesión activa"}</p>
            <div className="mt-4">
              <AuthControls isAuthenticated userEmail={userEmail} />
            </div>
          </div>
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-col">
        <header className="border-b border-white/8 bg-background/40 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.32em] text-slate-400">Inspira Tech</p>
              <h1 className="font-heading text-xl font-semibold tracking-tight text-white">
                Gestiona tu comunicación desde un solo panel
              </h1>
            </div>
            <div className="hidden rounded-full border border-white/8 bg-white/4 px-4 py-2 text-xs text-slate-300 md:block">
              Diseño unificado · contenido en español
            </div>
          </div>
        </header>

        <main id="contenido-principal" className="flex-1 px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
