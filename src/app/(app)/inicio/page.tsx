export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, Clock3, Radio, TriangleAlert, UsersRound } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listSavedGroups } from "@/db/savedGroups";
import { listScheduledMessages, listHistoryMessages } from "@/db/scheduledMessages";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { getConnectionState } from "@/lib/evolutionClient";
import { authorizePage } from "@/lib/currentUser";

const statusCopy: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Programado", className: "bg-[#2ae5dc]/12 text-[#8ef7f1] border-[#2ae5dc]/20" },
  sent: { label: "Enviado", className: "bg-[#14e478]/12 text-[#8bf4b6] border-[#14e478]/20" },
  failed: { label: "Falló", className: "bg-[#fe924b]/12 text-[#ffc69f] border-[#fe924b]/20" },
  cancelled: { label: "Cancelado", className: "bg-white/6 text-slate-300 border-white/10" },
};

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function InicioPage() {
  const user = await authorizePage();
  const [groups, scheduledMessages, history] = await Promise.all([
    listSavedGroups(user.id),
    listScheduledMessages(user.id),
    listHistoryMessages(user.id),
  ]);

  const activeGroups = groups.filter((group) => group.is_active);
  const pendingMessages = scheduledMessages.filter((message) => message.status === "scheduled");
  const recentFailures = history.filter((message) => message.status === "failed").slice(0, 3);
  const nextMessage = pendingMessages
    .sort((a, b) => +new Date(a.scheduled_for) - +new Date(b.scheduled_for))[0] ?? null;

  let connectionState: "connected" | "disconnected" | "unknown" = "unknown";
  try {
    const instance = await getOrCreateEvolutionInstance(user.id);
    const state = await getConnectionState(instance.instance_name);
    connectionState = state.instance.state === "open" ? "connected" : "disconnected";
  } catch {
    connectionState = "unknown";
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,57,148,0.55),rgba(71,64,255,0.38),rgba(42,229,220,0.12))] p-6 shadow-[0_22px_70px_rgba(9,14,53,0.35)] lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(42,229,220,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(20,228,120,0.15),transparent_22%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <Badge className="border-white/12 bg-white/8 text-slate-100">Centro de control</Badge>
            <div className="space-y-3">
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-white lg:text-4xl">
                Todo listo para coordinar tus envíos con más claridad y menos fricción.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-200/90 lg:text-base">
                Revisa la conexión de WhatsApp, tus próximos mensajes y los puntos que necesitan atención desde una sola vista.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button render={<Link href="/schedule" />}>Programar mensaje</Button>
              <Button variant="outline" render={<Link href="/groups" />}>Gestionar grupos</Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.6rem] border border-white/10 bg-[#040535]/35 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Estado de conexión</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {connectionState === "connected"
                    ? "WhatsApp conectado"
                    : connectionState === "disconnected"
                    ? "Conexión pendiente"
                    : "Estado no disponible"}
                </p>
              </div>
              <span className={`size-3 rounded-full ${connectionState === "connected" ? "bg-[#14e478]" : connectionState === "disconnected" ? "bg-[#fe924b]" : "bg-slate-500"}`} />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Próximo envío</p>
                <p className="mt-1 text-sm font-semibold text-white">{nextMessage ? nextMessage.group_name : "Aún no programado"}</p>
              </div>
              <p className="text-right text-xs text-slate-300">{nextMessage ? formatDate(nextMessage.scheduled_for) : "Crea el primero"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Conexión",
            value: connectionState === "connected" ? "Activa" : connectionState === "disconnected" ? "Pendiente" : "Sin datos",
            description: "Verifica que WhatsApp esté disponible antes del próximo envío.",
            icon: Radio,
          },
          {
            title: "Grupos activos",
            value: String(activeGroups.length),
            description: `${groups.length} grupo${groups.length === 1 ? "" : "s"} en total`,
            icon: UsersRound,
          },
          {
            title: "Mensajes programados",
            value: String(pendingMessages.length),
            description: "Envíos pendientes para las próximas horas o días.",
            icon: CalendarClock,
          },
          {
            title: "Alertas recientes",
            value: String(recentFailures.length),
            description: recentFailures.length > 0 ? "Revisa los últimos fallos desde historial." : "No hay fallos recientes.",
            icon: TriangleAlert,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="bg-white/6">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.28em] text-slate-400">{item.title}</p>
                    <CardTitle className="mt-3 text-3xl text-white">{item.value}</CardTitle>
                  </div>
                  <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[#2ae5dc]">
                    <Icon className="size-5" />
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-300">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-white">Próximos mensajes</CardTitle>
                <CardDescription>Los siguientes envíos previstos desde tu espacio de trabajo.</CardDescription>
              </div>
              <Button variant="ghost" render={<Link href="/schedule" />}>
                Ver programación <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingMessages.slice(0, 4).length > 0 ? (
              pendingMessages.slice(0, 4).map((message) => (
                <div key={message.id} className="flex flex-col gap-3 rounded-[1.4rem] border border-white/8 bg-white/4 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{message.group_name}</p>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-300">{message.content}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <Badge className={statusCopy[message.status]?.className}>{statusCopy[message.status]?.label ?? message.status}</Badge>
                    <span className="inline-flex items-center gap-2 text-xs text-slate-400"><Clock3 className="size-3.5" /> {formatDate(message.scheduled_for)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-white/12 bg-white/3 px-5 py-8 text-center">
                <p className="text-sm font-medium text-white">Aún no tienes mensajes programados.</p>
                <p className="mt-2 text-sm text-slate-400">Crea tu primer envío y aparecerá aquí como referencia rápida.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-white">Atención reciente</CardTitle>
                <CardDescription>Señales rápidas para que no pierdas el ritmo operativo.</CardDescription>
              </div>
              <Button variant="ghost" render={<Link href="/history" />}>Abrir historial</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentFailures.length > 0 ? (
              recentFailures.map((item) => (
                <div key={item.id} className="rounded-[1.35rem] border border-[#fe924b]/18 bg-[#fe924b]/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{item.group_name}</p>
                    <Badge className="bg-[#fe924b]/12 text-[#ffc69f] border-[#fe924b]/20">Revisar</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.error_message ?? "Hubo un problema al enviar el mensaje programado."}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-[#14e478]/16 bg-[#14e478]/8 p-4">
                <div className="flex items-center gap-2 text-[#8bf4b6]">
                  <CheckCircle2 className="size-4" />
                  <p className="text-sm font-semibold">Todo bajo control</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">No se detectaron fallos recientes. Puedes seguir programando con tranquilidad.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
