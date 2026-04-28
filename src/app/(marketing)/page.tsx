import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, MessagesSquare, ShieldCheck, Smartphone } from "lucide-react";
import { redirect } from "next/navigation";

import AuthControls from "@/components/auth/AuthControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/currentUser";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/inicio");
  }

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-10 pt-6 lg:px-8 lg:pb-16">
        <header className="flex items-center justify-between gap-4 py-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-[#2ae5dc] via-[#0f3994] to-[#4740ff] shadow-[0_12px_36px_rgba(42,229,220,0.22)]">
              <MessagesSquare className="size-5 text-white" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-white">Inspira Updates</p>
              <p className="text-xs text-slate-400">Mensajes programados con elegancia operativa</p>
            </div>
          </Link>

          <AuthControls isAuthenticated={false} />
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <div className="space-y-8">
            <Badge className="border-white/10 bg-white/7 text-slate-100">Paleta Inspira Tech · Experiencia en español</Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Tu centro de control para programar anuncios en WhatsApp sin perder claridad.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 lg:text-lg">
                Conecta tu sesión, organiza tus grupos y programa mensajes en un espacio visualmente coherente, profesional y fácil de recorrer.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <AuthControls isAuthenticated={false} />
              <Button variant="outline" render={<Link href="#beneficios" />}>
                Ver beneficios <ArrowRight className="size-4" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: "Conexión guiada", desc: "Escanea el QR y confirma el estado de WhatsApp en segundos.", icon: Smartphone },
                { title: "Programación clara", desc: "Prioriza el próximo envío con una interfaz enfocada en la tarea principal.", icon: Clock3 },
                { title: "Historial confiable", desc: "Consulta alertas y resultados recientes sin perder contexto.", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-white/8 bg-white/4 p-4 backdrop-blur-sm">
                    <span className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#2ae5dc]">
                      <Icon className="size-4.5" />
                    </span>
                    <p className="mt-4 text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(42,229,220,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(71,64,255,0.28),transparent_34%)] blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#090d3f]/70 p-5 shadow-[0_30px_90px_rgba(3,7,32,0.4)] backdrop-blur-xl">
              <div className="rounded-[1.7rem] border border-white/8 bg-gradient-to-br from-[#0f3994]/42 via-[#4740ff]/18 to-transparent p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Vista previa</p>
                    <p className="mt-2 font-heading text-2xl text-white">Un panel sereno para tus envíos</p>
                  </div>
                  <Badge className="bg-[#14e478]/12 text-[#8bf4b6] border-[#14e478]/20">Listo para usar</Badge>
                </div>
                <div className="mt-5 grid gap-4">
                  <Card className="bg-white/6">
                    <CardHeader>
                      <CardTitle className="text-white">Resumen del día</CardTitle>
                      <CardDescription>Estado de conexión, grupos activos y próximos mensajes.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["Conexión", "Activa"],
                        ["Grupos", "12 activos"],
                        ["Próximo envío", "Hoy · 6:30 p. m."],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/8 bg-white/4 p-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                          <p className="mt-2 text-sm font-semibold text-white">{value}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Flujo recomendado</p>
                      <ol className="mt-3 space-y-2 text-sm text-slate-200">
                        <li>1. Conecta WhatsApp</li>
                        <li>2. Activa tus grupos</li>
                        <li>3. Programa el siguiente anuncio</li>
                      </ol>
                    </div>
                    <div className="rounded-[1.4rem] border border-[#2ae5dc]/15 bg-[#2ae5dc]/8 p-4">
                      <div className="flex items-center gap-2 text-[#8ef7f1]">
                        <CheckCircle2 className="size-4" />
                        <p className="text-sm font-semibold">Diseño consistente</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        El aterrizaje y la app comparten tonos, jerarquía y lenguaje para que la experiencia se sienta continua.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="grid gap-4 py-8 lg:grid-cols-3">
          {[
            {
              title: "Menos pasos para empezar",
              desc: "La navegación resalta qué hacer primero y qué revisar después, sin pantallas aisladas ni mensajes ambiguos.",
            },
            {
              title: "Estados que se entienden rápido",
              desc: "Conexiones, alertas y envíos usan una jerarquía visual consistente para saber qué está bien y qué requiere acción.",
            },
            {
              title: "Español en toda la experiencia",
              desc: "Botones, ayudas, formularios y estados hablan el mismo idioma que tu operación diaria.",
            },
          ].map((item) => (
            <Card key={item.title} className="bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-300">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
