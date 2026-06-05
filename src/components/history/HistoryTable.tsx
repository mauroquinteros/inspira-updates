"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SavedGroup } from "@/db/savedGroups";
import type { HistoryMessage } from "@/db/scheduledMessages";
import EditMessageModal from "./EditMessageModal";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Programado", className: "bg-[#2ae5dc]/12 text-[#8ef7f1] border-[#2ae5dc]/20" },
  sent: { label: "Enviado", className: "bg-[#14e478]/12 text-[#8bf4b6] border-[#14e478]/20" },
  failed: { label: "Falló", className: "bg-[#fe924b]/12 text-[#ffc69f] border-[#fe924b]/20" },
  cancelled: { label: "Cancelado", className: "bg-white/6 text-slate-300 border-white/10" },
};

function formatDatetime(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface HistoryTableProps {
  rows: HistoryMessage[];
  activeGroups: SavedGroup[];
  onUpdated: () => void;
}

export default function HistoryTable({ rows, activeGroups, onUpdated }: HistoryTableProps) {
  const [selected, setSelected] = useState<HistoryMessage | null>(null);
  const [editing, setEditing] = useState<HistoryMessage | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 px-5 py-10 text-center">
        <p className="text-sm font-medium text-white">No encontramos registros para este filtro.</p>
        <p className="mt-2 text-sm text-slate-400">Prueba con otro estado o revisa después de tu siguiente envío.</p>
      </div>
    );
  }

  const canShowDetail = (message: HistoryMessage) => message.status === "failed" && (message.error_message || message.response_payload);

  return (
    <>
      <div className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/8">
        <Table>
          <TableHeader>
            <TableRow className="border-white/8 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-[0.24em] text-slate-400">Grupo</TableHead>
              <TableHead className="text-xs uppercase tracking-[0.24em] text-slate-400">Mensaje</TableHead>
              <TableHead className="text-xs uppercase tracking-[0.24em] text-slate-400 whitespace-nowrap">Programado para</TableHead>
              <TableHead className="text-xs uppercase tracking-[0.24em] text-slate-400 whitespace-nowrap">Enviado a las</TableHead>
              <TableHead className="text-xs uppercase tracking-[0.24em] text-slate-400">Estado</TableHead>
              <TableHead className="text-xs uppercase tracking-[0.24em] text-slate-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((message) => {
              const status = STATUS_STYLES[message.status] ?? STATUS_STYLES.cancelled;
              return (
                <TableRow
                  key={message.id}
                  className={canShowDetail(message) ? "cursor-pointer border-white/8 hover:bg-[#fe924b]/8" : "border-white/8 hover:bg-white/4"}
                  onClick={() => canShowDetail(message) && setSelected(message)}
                >
                  <TableCell className="font-mono text-xs text-slate-300">{message.group_name}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 whitespace-normal break-words text-sm text-white">{message.content}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{formatDatetime(message.scheduled_for)}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{formatDatetime(message.sent_at)}</TableCell>
                  <TableCell>
                    <Badge className={status.className}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {message.status === "scheduled" ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setEditing(message); }}
                        aria-label="Editar mensaje"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#2ae5dc] transition-colors hover:bg-[#2ae5dc]/15"
                      >
                        <SquarePen className="size-4" />
                      </button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del error de ejecución</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              {selected.error_message ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mensaje de error</p>
                  <p className="mt-2 rounded-[1.2rem] border border-[#fe924b]/20 bg-[#fe924b]/8 p-4 text-sm leading-6 text-slate-200">
                    {selected.error_message}
                  </p>
                </div>
              ) : null}
              {selected.response_payload ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Respuesta técnica</p>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-[1.2rem] border border-white/8 bg-white/4 p-4 text-xs text-slate-200">
                    {JSON.stringify(selected.response_payload as Record<string, unknown>, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <EditMessageModal
        message={editing}
        activeGroups={activeGroups}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          onUpdated();
        }}
      />
    </>
  );
}
