"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Clock, MessageSquare, SaveAll, UsersRound } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SavedGroup } from "@/db/savedGroups";
import type { HistoryMessage } from "@/db/scheduledMessages";
import { updateScheduledMessage } from "@/lib/api/scheduledMessages";

interface EditMessageFormProps {
  message: HistoryMessage;
  activeGroups: SavedGroup[];
  onSaved: () => void;
  onCancel: () => void;
}

// Parte una fecha en el string "HH:mm" de su hora local, para precargar el input de hora.
function toTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// Combina la fecha del calendario con la hora "HH:mm" y devuelve el instante en ISO (UTC).
function combineToISO(date: Date, time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export default function EditMessageForm({ message, activeGroups, onSaved, onCancel }: EditMessageFormProps) {
  const initialDate = new Date(message.scheduled_for);

  const [groupId, setGroupId] = useState(message.group_id);
  const [content, setContent] = useState(message.content);
  const [date, setDate] = useState<Date | undefined>(() => initialDate);
  const [time, setTime] = useState(() => toTimeString(initialDate));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!date || !time) return;
    setError(null);
    setLoading(true);

    try {
      await updateScheduledMessage(message.id, {
        group_id: groupId,
        content,
        scheduled_for: combineToISO(date, time),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos guardar los cambios.");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDisabled = loading || !groupId || !content || !date || !time;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
      {/* Group */}
      <div className="space-y-2">
        <label htmlFor="edit-grupo-destino" className="flex items-center gap-2 text-sm font-medium text-[#2ae5dc]">
          <UsersRound className="size-4" /> Grupo
        </label>
        <Select value={groupId} onValueChange={(v) => setGroupId(v ?? "")} required>
          <SelectTrigger id="edit-grupo-destino" className="w-full bg-white/8">
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
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[#2ae5dc]">
            <CalendarDays className="size-4" /> Fecha de envío
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
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-hora-envio" className="flex items-center gap-2 text-sm font-medium text-[#2ae5dc]">
            <Clock className="size-4" /> Hora de envío
          </label>
          <Input
            id="edit-hora-envio"
            type="time"
            step="1"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="bg-white/8 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label htmlFor="edit-mensaje-contenido" className="flex items-center gap-2 text-sm font-medium text-[#2ae5dc]">
          <MessageSquare className="size-4" /> Mensaje
        </label>
        <Textarea
          id="edit-mensaje-contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe el contenido del mensaje aquí..."
          required
          className="bg-white/8 min-h-[7rem] max-h-52 resize-none overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-white/25"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos guardar los cambios</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-white/12 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isDisabled}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#2ae5dc] px-4 py-2 text-sm font-semibold text-[#040535] transition-colors hover:bg-[#2ae5dc]/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SaveAll className="size-4" />
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
