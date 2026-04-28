"use client";

import { useState } from "react";
import { CalendarClock, MessageSquareMore, UsersRound } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SavedGroup } from "@/db/savedGroups";
import type { ScheduledMessage } from "@/db/scheduledMessages";

interface ScheduleFormProps {
  activeGroups: SavedGroup[];
  onScheduled: (message: ScheduledMessage) => void;
}

export default function ScheduleForm({ activeGroups, onScheduled }: ScheduleFormProps) {
  const [groupId, setGroupId] = useState("");
  const [content, setContent] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const scheduledForUtc = new Date(scheduledFor).toISOString();
      const res = await fetch("/api/scheduled-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          content,
          scheduled_for: scheduledForUtc,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No pudimos guardar la programación.");
        return;
      }

      const message = await res.json();
      onScheduled(message as ScheduledMessage);
      setContent("");
      setScheduledFor("");
      setGroupId("");
    } catch {
      setError("Se perdió la conexión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const minDatetime = (() => {
    const date = new Date(Date.now() + 60000);
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {activeGroups.length === 0 ? (
        <Alert>
          <AlertTitle>No hay grupos activos para programar</AlertTitle>
          <AlertDescription>Activa al menos un grupo desde la sección de grupos antes de crear un envío.</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="grupo-destino" className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <UsersRound className="size-4 text-[#2ae5dc]" /> Grupo destino
        </label>
        <Select value={groupId} onValueChange={(value) => setGroupId(value ?? "")} required>
          <SelectTrigger id="grupo-destino" className="w-full">
            <SelectValue placeholder="Selecciona un grupo activo" />
          </SelectTrigger>
          <SelectContent>
            {activeGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.group_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-400">Solo se muestran los grupos que están activos para nuevos envíos.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="mensaje-contenido" className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <MessageSquareMore className="size-4 text-[#2ae5dc]" /> Mensaje
        </label>
        <Textarea
          id="mensaje-contenido"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escribe el mensaje que quieres enviar al grupo seleccionado"
          required
          rows={5}
        />
        <p className="text-xs text-slate-400">Redacta un texto claro. Podrás revisarlo en la cola antes de que salga.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="fecha-envio" className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <CalendarClock className="size-4 text-[#2ae5dc]" /> Fecha y hora de envío
        </label>
        <Input
          id="fecha-envio"
          type="datetime-local"
          value={scheduledFor}
          onChange={(event) => setScheduledFor(event.target.value)}
          min={minDatetime}
          required
        />
        <p className="text-xs text-slate-400">Elige un momento futuro con al menos un minuto de diferencia.</p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>No pudimos programar el mensaje</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" disabled={loading || !groupId || activeGroups.length === 0} className="w-full">
        {loading ? "Guardando programación..." : "Programar mensaje"}
      </Button>
    </form>
  );
}
