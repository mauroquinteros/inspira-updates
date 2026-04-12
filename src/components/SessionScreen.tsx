"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type ConnectionState = "open" | "close" | "connecting" | "unknown";

const STATE_LABELS: Record<ConnectionState, string> = {
  open: "Connected",
  connecting: "Connecting",
  close: "Disconnected",
  unknown: "Unknown",
};

const STATE_VARIANTS: Record<ConnectionState, "default" | "secondary" | "destructive" | "outline"> = {
  open: "default",
  connecting: "secondary",
  close: "destructive",
  unknown: "outline",
};

export default function SessionScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<ConnectionState>("unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/instance/status");
      if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
      const data = await res.json();
      setState(data.state ?? "unknown");
    } catch (err) {
      console.error(err);
      // don't overwrite main error — status polling failures are soft
    }
  }, []);

  const initSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. create instance (idempotent)
      const createRes = await fetch("/api/whatsapp/instance/create", { method: "POST" });
      if (!createRes.ok) {
        const body = await createRes.json();
        throw new Error(body.error ?? "Failed to create instance");
      }

      // 2. check status first
      await fetchStatus();

      // 3. fetch QR
      const qrRes = await fetch("/api/whatsapp/instance/qr");
      if (!qrRes.ok) {
        const body = await qrRes.json();
        throw new Error(body.error ?? "Failed to get QR code");
      }
      const { qr } = await qrRes.json();

      if (canvasRef.current && qr) {
        await QRCode.toCanvas(canvasRef.current, qr, {
          width: 256,
          margin: 2,
          color: { dark: "#0f172a", light: "#f8fafc" },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    initSession();

    intervalRef.current = setInterval(fetchStatus, 15_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initSession, fetchStatus]);

  const isConnected = state === "open";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-slate-100">
            WhatsApp Session
          </h1>
          <Badge
            variant={STATE_VARIANTS[state]}
            className={
              state === "open"
                ? "bg-emerald-600 text-white border-0"
                : state === "connecting"
                ? "bg-amber-500 text-slate-950 border-0"
                : undefined
            }
          >
            {STATE_LABELS[state]}
          </Badge>
        </div>

        {/* Main card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              {isConnected ? "Session Active" : "Scan QR Code"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {loading && <Skeleton className="w-64 h-64 rounded bg-slate-800" />}

            {!loading && isConnected && (
              <div className="w-64 h-64 flex flex-col items-center justify-center gap-3 rounded border border-emerald-800 bg-emerald-950">
                <svg
                  className="w-12 h-12 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-emerald-300 font-medium">WhatsApp connected</p>
              </div>
            )}

            {/* Always mounted so canvasRef is never null when QR data arrives */}
            <canvas
              ref={canvasRef}
              className={`rounded border border-slate-700 ${loading || isConnected ? "hidden" : ""}`}
              width={256}
              height={256}
            />

            {state === "close" && !loading && (
              <Button
                variant="outline"
                size="sm"
                onClick={initSession}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              >
                Reconnect
              </Button>
            )}

            {!isConnected && !loading && !error && (
              <p className="text-xs text-slate-500 text-center">
                Open WhatsApp → Linked Devices → Link a Device
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-600">
          Status refreshes every 15 s
        </p>
      </div>
    </main>
  );
}
