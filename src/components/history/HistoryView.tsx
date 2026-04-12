"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusFilter from "./StatusFilter";
import HistoryTable from "./HistoryTable";
import type { HistoryMessage } from "@/db/scheduledMessages";

interface HistoryViewProps {
  initialMessages: HistoryMessage[];
  status?: string;
}

export default function HistoryView({ initialMessages, status }: HistoryViewProps) {
  const [messages, setMessages] = useState<HistoryMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentStatus = searchParams.get("status") ?? undefined;
    const url = currentStatus
      ? `/api/history?status=${currentStatus}`
      : "/api/history";

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(url);
        const data: HistoryMessage[] = await res.json();
        if (!cancelled) setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [searchParams]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-mono text-sm text-slate-300 uppercase tracking-widest">
          Execution History
        </h1>
        <span className="font-mono text-xs text-slate-600">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="sr-only">History Filters</CardTitle>
          <StatusFilter currentStatus={status} />
        </CardHeader>
        <CardContent className={loading ? "opacity-50 pointer-events-none" : ""}>
          <HistoryTable rows={messages} />
        </CardContent>
      </Card>
    </div>
  );
}
