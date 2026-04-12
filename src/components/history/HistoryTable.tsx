"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HistoryMessage } from "@/db/scheduledMessages";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-slate-800 text-slate-300 border-slate-600",
  sent: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  failed: "bg-red-900/40 text-red-300 border-red-700",
  cancelled: "bg-slate-800/60 text-slate-500 border-slate-700",
};

function formatDatetime(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface HistoryTableProps {
  rows: HistoryMessage[];
}

export default function HistoryTable({ rows }: HistoryTableProps) {
  const [selected, setSelected] = useState<HistoryMessage | null>(null);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-600 font-mono text-center py-12">
        No messages found.
      </p>
    );
  }

  const canShowDetail = (msg: HistoryMessage) =>
    msg.status === "failed" && (msg.error_message || msg.response_payload);

  return (
    <>
      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                Group
              </TableHead>
              <TableHead className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                Message Preview
              </TableHead>
              <TableHead className="font-mono text-xs text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Scheduled At
              </TableHead>
              <TableHead className="font-mono text-xs text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Sent At
              </TableHead>
              <TableHead className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((msg) => (
              <TableRow
                key={msg.id}
                className={`border-slate-800 transition-colors ${
                  canShowDetail(msg)
                    ? "cursor-pointer hover:bg-red-950/20"
                    : "hover:bg-slate-900/60"
                }`}
                onClick={() => canShowDetail(msg) && setSelected(msg)}
              >
                <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap">
                  {msg.group_name}
                </TableCell>
                <TableCell className="text-sm text-slate-300 max-w-xs truncate">
                  {msg.message_preview}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                  {formatDatetime(msg.scheduled_for)}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                  {formatDatetime(msg.sent_at)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs font-mono border ${STATUS_STYLES[msg.status] ?? STATUS_STYLES.cancelled}`}
                  >
                    {msg.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm text-slate-300 uppercase tracking-widest">
              Execution Error
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {selected.error_message && (
                <div>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
                    Error Message
                  </p>
                  <p className="text-sm text-red-300 bg-red-950/30 rounded p-3 border border-red-900/40 font-mono">
                    {selected.error_message}
                  </p>
                </div>
              )}
              {Boolean(selected.response_payload) && (
                <div>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">
                    Response Payload
                  </p>
                  <pre className="text-xs text-slate-300 bg-slate-800 rounded p-3 border border-slate-700 overflow-auto max-h-60 font-mono">
                    {JSON.stringify(selected.response_payload as Record<string, unknown>, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
