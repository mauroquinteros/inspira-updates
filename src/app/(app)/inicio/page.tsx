export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, CalendarCheck2, CalendarClock, Clock3, SendHorizonal, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FormattedDate } from "@/components/ui/formatted-date";
import { listSavedGroups } from "@/db/savedGroups";
import { listScheduledMessages } from "@/db/scheduledMessages";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { getConnectionState } from "@/lib/evolutionClient";
import { authorizePage } from "@/lib/currentUser";
import QRPanel from "@/components/QRPanel";

const statusCopy: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Programado", className: "bg-[#2ae5dc]/12 text-[#8ef7f1] border-[#2ae5dc]/20" },
  sent: { label: "Enviado", className: "bg-[#14e478]/12 text-[#8bf4b6] border-[#14e478]/20" },
  failed: { label: "Falló", className: "bg-[#fe924b]/12 text-[#ffc69f] border-[#fe924b]/20" },
  cancelled: { label: "Cancelado", className: "bg-white/6 text-slate-300 border-white/10" },
};

export default async function InicioPage() {
  const user = await authorizePage();
  const [groups, scheduledMessages] = await Promise.all([
    listSavedGroups(user.id),
    listScheduledMessages(user.id),
  ]);

  const activeGroups = groups.filter((g) => g.is_active);
  const pendingMessages = scheduledMessages
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => +new Date(a.scheduled_for) - +new Date(b.scheduled_for));
  const nextMessage = pendingMessages[0] ?? null;

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
      {/* Connection card */}
      <QRPanel initialState={connectionState} />

      {/* Stat cards */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-[#2ae5dc]">
            <UsersRound className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-400">Grupos activos</p>
            <p className="mt-0.5 text-3xl font-bold tabular-nums text-white">{activeGroups.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-[#2ae5dc]">
            <CalendarClock className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-slate-400">Mensajes programados</p>
            <div className="flex items-baseline gap-2">
              <p className="mt-0.5 text-3xl font-bold tabular-nums text-white">{pendingMessages.length}</p>
              <p className="text-sm text-slate-400">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-[#2ae5dc]">
            <CalendarCheck2 className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-400">Próximo envío</p>
            <p className="mt-0.5 text-2xl font-bold text-white"><FormattedDate date={nextMessage?.scheduled_for ?? null} relative fallback="Sin envíos" /></p>
            {nextMessage && (
              <p className="mt-0.5 truncate text-xs text-[#2ae5dc]">{nextMessage.group_name}</p>
            )}
          </div>
          <SendHorizonal className="size-8 shrink-0 text-white/8" />
        </div>
      </section>

      {/* Upcoming messages */}
      <section>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">Próximos mensajes</h2>
            <p className="text-sm text-slate-400">Los siguientes envíos previstos desde tu espacio de trabajo.</p>
          </div>
          <Link
            href="/schedule"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            Ver mensajes agendados <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="rounded-[1.5rem] border border-white/8 bg-white/3 p-4">
          {pendingMessages.length > 0 ? (
            <div className="space-y-3">
              {pendingMessages.slice(0, 5).map((message) => (
                <div
                  key={message.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/4 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-white">{message.group_name}</p>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-400">{message.content}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                    <Badge className={statusCopy[message.status]?.className}>
                      {statusCopy[message.status]?.label ?? message.status}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock3 className="size-3.5" />
                      <FormattedDate date={message.scheduled_for} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/12 px-6 py-12 text-center">
              <p className="font-semibold text-white">Aún no tienes mensajes agendados.</p>
              <p className="mt-2 text-sm text-slate-400">Crea tu primer envío y aparecerá aquí como referencia rápida.</p>
            </div>
          )}
        </div>
      </section>

      {/* Info note — shown only when disconnected */}
      {connectionState !== "connected" && (
        <div className="flex items-start gap-3 rounded-[1.5rem] border border-white/8 bg-white/3 p-5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#2ae5dc]/30 bg-[#2ae5dc]/10 text-[#2ae5dc]">
            <span className="text-[10px] font-bold">i</span>
          </span>
          <p className="text-sm leading-6 text-slate-400">
            <span className="font-medium text-slate-300">Nota:</span> La sesión permanecerá activa mientras no cierres sesión manualmente desde tu teléfono o la plataforma. Mantén tu teléfono con conexión a internet para asegurar la puntualidad de los envíos.
          </p>
        </div>
      )}
    </div>
  );
}
