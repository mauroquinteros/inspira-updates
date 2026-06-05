"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, History } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusFilter from "./StatusFilter";
import HistoryTable from "./HistoryTable";
import type { SavedGroup } from "@/db/savedGroups";
import type { HistoryMessage } from "@/db/scheduledMessages";

interface HistoryViewProps {
  initialMessages: HistoryMessage[];
  activeGroups: SavedGroup[];
  status?: string;
}

export default function HistoryView({ initialMessages, activeGroups, status }: HistoryViewProps) {
  const [messages, setMessages] = useState<HistoryMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const historyUrl = useCallback(() => {
    const currentStatus = searchParams.get("status") ?? undefined;
    return currentStatus ? `/api/history?status=${currentStatus}` : "/api/history";
  }, [searchParams]);

  // Refetch manual (tras editar un mensaje), reutilizable desde la tabla.
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(historyUrl());
      const data: HistoryMessage[] = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [historyUrl]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(historyUrl());
        const data: HistoryMessage[] = await res.json();
        if (!cancelled) setMessages(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [historyUrl]);

  return (
    <div className="space-y-5">
      <Card className="bg-white/5">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="bg-white/7 text-slate-100 border-white/10">Seguimiento operativo</Badge>
              <div>
                <CardTitle className="text-2xl text-white">Historial de ejecución</CardTitle>
                <CardDescription>
                  Revisa qué se envió, qué quedó cancelado y qué necesita seguimiento desde un solo lugar.
                </CardDescription>
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {messages.length} registro{messages.length === 1 ? "" : "s"}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-[#0e1136]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#2ae5dc]">
              <History className="size-5" />
            </span>
            Consulta y filtra resultados
          </CardTitle>
          <CardDescription>Los filtros te ayudan a enfocarte en el estado que quieres revisar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <StatusFilter currentStatus={status} />
          <div className={loading ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
            <HistoryTable rows={messages} activeGroups={activeGroups} onUpdated={reload} />
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <Activity className="size-3.5" />
            El historial se actualiza automáticamente cuando cambias de filtro.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
