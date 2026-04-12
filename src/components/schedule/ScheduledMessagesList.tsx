"use client";

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

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-sky-900/40 text-sky-300 border-sky-700",
  sent: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  failed: "bg-red-900/40 text-red-300 border-red-700",
  cancelled: "bg-slate-800 text-slate-500 border-slate-700",
};

function formatDatetime(date: Date | string) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ScheduledMessagesList({
  messages,
  onCancel,
}: ScheduledMessagesListProps) {
  if (messages.length === 0) {
    return (
      <p className="text-sm text-slate-600 font-mono text-center py-8">
        No scheduled messages yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {messages.map((msg) => (
        <li
          key={msg.id}
          className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-slate-500 mb-1">
                {msg.group_name}
              </p>
              <p className="text-sm text-slate-200 leading-snug line-clamp-2">
                {msg.content}
              </p>
            </div>
            <Badge
              className={`shrink-0 text-xs font-mono border ${STATUS_STYLES[msg.status] ?? STATUS_STYLES.cancelled}`}
            >
              {msg.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-mono">
              {formatDatetime(msg.scheduled_for)}
            </span>
            {msg.status === "scheduled" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500 hover:text-red-400 hover:bg-red-950/30 font-mono h-7 px-2"
                onClick={() => onCancel(msg.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
