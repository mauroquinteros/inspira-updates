"use client";

import { MessageSquareText } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScheduleForm from "./ScheduleForm";
import type { SavedGroup } from "@/db/savedGroups";
import type { ScheduledMessage } from "@/db/scheduledMessages";

interface ScheduleViewProps {
  activeGroups: SavedGroup[];
}

export default function ScheduleView({ activeGroups }: ScheduleViewProps) {
  function handleScheduled(_message: ScheduledMessage) {}

  return (
    <div className="space-y-5">
      <Card className="bg-white/5">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="bg-white/7 text-slate-100 border-white/10">Flujo principal</Badge>
              <div>
                <CardTitle className="text-2xl text-white">Agenda mensajes con contexto completo</CardTitle>
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

      <Card className="bg-[#0e1136]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#2ae5dc]">
              <MessageSquareText className="size-5" />
            </span>
            Crear nuevo envío
          </CardTitle>
          <CardDescription>Todo el contenido y las ayudas están pensados para que agendes rápido y con menos errores.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm activeGroups={activeGroups} onScheduled={handleScheduled} />
        </CardContent>
      </Card>
    </div>
  );
}
