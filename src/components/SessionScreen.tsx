"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { AlertTriangle, CheckCircle2, QrCode, RefreshCcw, Smartphone } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ConnectionState = "open" | "close" | "connecting" | "unknown";

const STATE_LABELS: Record<ConnectionState, string> = {
  open: "Conectado",
  connecting: "Conectando",
  close: "Desconectado",
  unknown: "Sin confirmar",
};

const STATE_STYLES: Record<ConnectionState, string> = {
  open: "bg-[#14e478]/12 text-[#8bf4b6] border-[#14e478]/20",
  connecting: "bg-[#2ae5dc]/12 text-[#8ef7f1] border-[#2ae5dc]/20",
  close: "bg-[#fe924b]/12 text-[#ffc69f] border-[#fe924b]/20",
  unknown: "bg-white/6 text-slate-300 border-white/10",
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
    }
  }, []);

  const initSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const createRes = await fetch("/api/whatsapp/instance/create", { method: "POST" });
      if (!createRes.ok) {
        throw new Error("No pudimos preparar tu instancia de WhatsApp.");
      }

      await fetchStatus();

      const qrRes = await fetch("/api/whatsapp/instance/qr");
      if (!qrRes.ok) {
        throw new Error("No pudimos generar el código QR en este momento.");
      }

      const { qr } = await qrRes.json();

      if (canvasRef.current && qr) {
        await QRCode.toCanvas(canvasRef.current, qr, {
          width: 280,
          margin: 2,
          color: { dark: "#040535", light: "#f8fbff" },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    initSession();
    intervalRef.current = setInterval(fetchStatus, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initSession, fetchStatus]);

  const isConnected = state === "open";

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge className={STATE_STYLES[state]}>{STATE_LABELS[state]}</Badge>
              <CardTitle className="text-2xl text-white">Conecta tu sesión de WhatsApp</CardTitle>
              <CardDescription>
                Escanea el código desde tu teléfono para habilitar los envíos programados en este espacio.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={initSession} disabled={loading}>
              <RefreshCcw className="size-4" />
              Actualizar QR
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>No fue posible completar la conexión</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex min-h-[360px] items-center justify-center rounded-[1.8rem] border border-white/10 bg-gradient-to-b from-white/6 to-white/3 p-6">
            {loading ? (
              <Skeleton className="h-[280px] w-[280px] rounded-[1.4rem]" />
            ) : isConnected ? (
              <div className="flex h-[280px] w-[280px] flex-col items-center justify-center rounded-[1.5rem] border border-[#14e478]/20 bg-[#14e478]/10 text-center">
                <div className="flex size-16 items-center justify-center rounded-full border border-[#14e478]/25 bg-[#14e478]/12 text-[#8bf4b6]">
                  <CheckCircle2 className="size-8" />
                </div>
                <p className="mt-5 text-lg font-semibold text-white">Sesión conectada</p>
                <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-300">
                  Ya puedes guardar grupos y programar mensajes desde el panel principal.
                </p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="rounded-[1.35rem] border border-white/10 bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
                width={280}
                height={280}
              />
            )}
          </div>

          {!isConnected && !loading && !error ? (
            <p className="text-sm leading-6 text-slate-400">
              Abre <span className="text-slate-200">WhatsApp → Dispositivos vinculados → Vincular dispositivo</span> y escanea el QR para continuar.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#2ae5dc]">
                <Smartphone className="size-5" />
              </span>
              Cómo hacerlo sin fricción
            </CardTitle>
            <CardDescription>Una guía breve para completar la vinculación a la primera.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {[
                "Abre WhatsApp en tu teléfono y entra a la sección de dispositivos vinculados.",
                "Mantén esta pantalla abierta hasta que el QR aparezca por completo.",
                "Si el código cambia o expira, usa “Actualizar QR” para generar uno nuevo.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3 rounded-[1.3rem] border border-white/8 bg-white/4 p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#4740ff]/18 font-semibold text-white">{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-300">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#fe924b]">
                <QrCode className="size-5" />
              </span>
              Señales que conviene revisar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
            <p>Si el estado aparece como <strong className="text-white">Desconectado</strong>, renueva el QR y vuelve a escanearlo.</p>
            <p>Si ya estás conectado pero no ves grupos disponibles, comprueba la conexión desde esta misma pantalla antes de volver a la programación.</p>
            <p className="text-slate-400">El estado se actualiza automáticamente cada 15 segundos.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
