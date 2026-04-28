"use client";

import { CalendarRange, MessageSquareText } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScheduleForm from "./ScheduleForm";
import ScheduledMessagesList from "./ScheduledMessagesList";
import type { SavedGroup } from "@/db/savedGroups";
import type { ScheduledMessage } from "@/db/scheduledMessages";

interface ScheduledMessageWithGroup extends ScheduledMessage {
  group_name: string;
}

interface ScheduleViewProps {
  activeGroups: SavedGroup[];
  initialMessages: ScheduledMessageWithGroup[];
}

export default function ScheduleView({ activeGroups, initialMessages }: ScheduleViewProps) {
  const [messages, setMessages] = useState<ScheduledMessageWithGroup[]>(initialMessages);

  function handleScheduled(message: ScheduledMessage) {
    const group = activeGroups.find((item) => item.id === message.group_id);
    const enriched: ScheduledMessageWithGroup = {
      ...message,
      group_name: group?.group_name ?? "Grupo no identificado",
    };
    setMessages((prev) => [enriched, ...prev]);
  }

  async function handleCancel(id: string) {
    try {
      const res = await fetch(`/api/scheduled-messages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        console.error("No se pudo cancelar el mensaje:", await res.text());
        return;
      }

      setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, status: "cancelled" as const } : message)));
    } catch (error) {
      console.error("Error cancelando mensaje:", error);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="bg-white/5">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="bg-white/7 text-slate-100 border-white/10">Flujo principal</Badge>
              <div>
                <CardTitle className="text-2xl text-white">Programa mensajes con contexto completo</CardTitle>
                <CardDescription>
                  Elige el grupo, redacta el mensaje y confirma la fecha sin perder de vista la cola de próximos envíos.
                </CardDescription>
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {activeGroups.length} grupo{activeGroups.length === 1 ? "" : "s"} activo{activeGroups.length === 1 ? "" : "s"}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#2ae5dc]">
                <MessageSquareText className="size-5" />
              </span>
              Crear nuevo envío
            </CardTitle>
            <CardDescription>Todo el contenido y las ayudas están pensados para que programes rápido y con menos errores.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleForm activeGroups={activeGroups} onScheduled={handleScheduled} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#4740ff]">
                <CalendarRange className="size-5" />
              </span>
              Cola de programación
            </CardTitle>
            <CardDescription>Consulta qué está pendiente y cancela lo necesario antes de que se envíe.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduledMessagesList messages={messages} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
