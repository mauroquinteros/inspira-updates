"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    // Find group name for the new message
    const group = activeGroups.find((g) => g.id === message.group_id);
    const enriched: ScheduledMessageWithGroup = {
      ...message,
      group_name: group?.group_name ?? "Unknown group",
    };
    setMessages((prev) => [enriched, ...prev]);
  }

  async function handleCancel(id: string) {
    try {
      const res = await fetch(`/api/scheduled-messages/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to cancel message:", await res.text());
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "cancelled" as const } : m))
      );
    } catch (err) {
      console.error("Cancel error:", err);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 items-start">
      {/* Form */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-mono text-slate-300 uppercase tracking-widest">
            New Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleForm activeGroups={activeGroups} onScheduled={handleScheduled} />
        </CardContent>
      </Card>

      {/* List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-mono text-slate-300 uppercase tracking-widest">
            Scheduled Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduledMessagesList messages={messages} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
