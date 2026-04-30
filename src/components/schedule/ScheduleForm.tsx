"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, MessageSquare, SendHorizonal, UsersRound } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SavedGroup } from "@/db/savedGroups";
import type { ScheduledMessage } from "@/db/scheduledMessages";

interface ScheduleFormProps {
  activeGroups: SavedGroup[];
  onScheduled: (message: ScheduledMessage) => void;
}

export default function ScheduleForm({ activeGroups, onScheduled }: ScheduleFormProps) {
  const [groupId, setGroupId] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!date || !time) return;
    setError(null);
    setLoading(true);

    try {
      const [hours, minutes] = time.split(":").map(Number);
      const scheduled = new Date(date);
      scheduled.setHours(hours, minutes, 0, 0);

      const res = await fetch("/api/scheduled-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_id: groupId,
          content,
          scheduled_for: scheduled.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No pudimos guardar el mensaje agendado.");
        return;
      }

      const message = await res.json();
      onScheduled(message as ScheduledMessage);
      setContent("");
      setDate(undefined);
      setTime("");
      setGroupId("");
    } catch {
      setError("Se perdió la conexión. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDisabled = loading || !groupId || !content || !date || !time || activeGroups.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {activeGroups.length === 0 && (
        <Alert>
          <AlertTitle>No hay grupos activos para agendar mensajes</AlertTitle>
          <AlertDescription>Activa al menos un grupo desde la sección de grupos antes de crear un envío.</AlertDescription>
        </Alert>
      )}

      {/* Group */}
      <div className="space-y-2">
        <label htmlFor="grupo-destino" className="flex items-center gap-2 text-sm font-medium text-[#2ae5dc]">
          <UsersRound className="size-4" /> Seleccionar Grupo
        </label>
        <Select value={groupId} onValueChange={(v) => setGroupId(v ?? "")} required>
          <SelectTrigger id="grupo-destino" className="w-full bg-white/8">
            <SelectValue placeholder="Selecciona un grupo..." />
          </SelectTrigger>
          <SelectContent>
            {activeGroups.map((group) => (
              <SelectItem
                key={group.id}
                value={group.id}
                className="py-2 pl-3 focus:bg-[#2ae5dc]/15 focus:text-white"
              >
                {group.group_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-400">Selecciona el grupo al que deseas enviar el mensaje.</p>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label htmlFor="mensaje-contenido" className="flex items-center gap-2 text-sm font-medium text-[#2ae5dc]">
          <MessageSquare className="size-4" /> Mensaje
        </label>
        <Textarea
          id="mensaje-contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe el contenido del mensaje aquí..."
          required
          rows={8}
          className="bg-white/8"
        />
        <p className="text-xs text-slate-400">Escribe un texto claro. Si quieres poner una frase en negrita, agrega un * al inicio y otro al final.</p>
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#2ae5dc]">
            <CalendarDays className="size-4" /> Fecha de Envío
          </label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger className="flex w-full items-center justify-between rounded-full border border-border bg-white/8 px-4 py-2 text-sm font-normal transition-colors hover:bg-white/12">
              <span className={date ? "text-white" : "text-slate-500"}>
                {date ? format(date, "dd/MM/yyyy") : "dd/mm/yyyy"}
              </span>
              <CalendarDays className="size-4 text-slate-400" />
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                defaultMonth={date}
                onSelect={(d) => { setDate(d); setCalendarOpen(false); }}
                disabled={(d) => d < today}
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-slate-400">Elige el día de envío.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="hora-envio" className="flex items-center gap-2 text-sm font-medium text-[#2ae5dc]">
            <MessageSquare className="size-4" /> Hora de Envío
          </label>
          <Input
            id="hora-envio"
            type="time"
            step="1"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="bg-white/8 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <p className="text-xs text-slate-400">Define la hora exacta (mínimo 1 min de diferencia).</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos agendar el mensaje</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2ae5dc] py-3 text-sm font-semibold text-[#040535] transition-colors hover:bg-[#2ae5dc]/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <SendHorizonal className="size-4" />
        {loading ? "Guardando mensaje agendado..." : "Agendar mensaje"}
      </button>
    </form>
  );
}
