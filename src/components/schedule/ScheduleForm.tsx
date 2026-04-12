"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        const data = await res.json();
        setError(data.error ?? "Failed to schedule message");
        return;
      }

      const message = await res.json();
      onScheduled(message as ScheduledMessage);
      setContent("");
      setScheduledFor("");
      setGroupId("");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  // Compute min datetime in local time (now + 1 minute)
  const minDatetime = (() => {
    const d = new Date(Date.now() + 60_000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Group
        </label>
        <Select value={groupId} onValueChange={(v) => setGroupId(v ?? "")} required>
          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200 focus:ring-slate-600">
            <SelectValue placeholder="Select a group…" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
            {activeGroups.map((g) => (
              <SelectItem
                key={g.id}
                value={g.id}
                className="focus:bg-slate-800 focus:text-slate-100"
              >
                {g.group_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Message
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message…"
          required
          rows={4}
          className="bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:ring-slate-600 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Send at
        </label>
        <Input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          min={minDatetime}
          required
          className="bg-slate-900 border-slate-700 text-slate-200 focus:ring-slate-600"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 font-mono">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading || !groupId}
        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 font-mono text-sm"
      >
        {loading ? "Scheduling…" : "Schedule Message"}
      </Button>
    </form>
  );
}
