"use client";

import { Clock3, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScheduledMessage } from "@/db/scheduledMessages";

interface ScheduledMessageWithGroup extends ScheduledMessage {
  group_name: string;
}

interface ScheduledMessagesListProps {
  messages: ScheduledMessageWithGroup[];
  onCancel: (id: string) => void;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Programado", className: "bg-[#2ae5dc]/12 text-[#8ef7f1] border-[#2ae5dc]/20" },
  sent: { label: "Enviado", className: "bg-[#14e478]/12 text-[#8bf4b6] border-[#14e478]/20" },
  failed: { label: "Falló", className: "bg-[#fe924b]/12 text-[#ffc69f] border-[#fe924b]/20" },
  cancelled: { label: "Cancelado", className: "bg-white/6 text-slate-300 border-white/10" },
};

function formatDatetime(date: Date | string) {
  return new Date(date).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ScheduledMessagesList({ messages, onCancel }: ScheduledMessagesListProps) {
  if (messages.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-10 text-center">
        <p className="text-sm font-medium text-white">Aún no tienes mensajes programados.</p>
        <p className="mt-2 text-sm text-slate-400">Cuando crees uno, aparecerá aquí con su estado y horario.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {messages.map((message) => {
        const status = STATUS_STYLES[message.status] ?? STATUS_STYLES.cancelled;
        return (
          <li key={message.id} className="rounded-[1.45rem] border border-white/8 bg-white/4 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{message.group_name}</p>
                <p className="text-sm leading-7 text-white">{message.content}</p>
                <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 className="size-3.5" />
                  {formatDatetime(message.scheduled_for)}
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 lg:items-end">
                <Badge className={status.className}>{status.label}</Badge>
                {message.status === "scheduled" ? (
                  <Button variant="ghost" size="sm" onClick={() => onCancel(message.id)}>
                    <XCircle className="size-4" /> Cancelar
                  </Button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
