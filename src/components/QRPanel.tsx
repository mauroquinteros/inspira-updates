"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, RefreshCcw, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ConnectionState = "open" | "close" | "connecting" | "unknown";

const STATE_LABELS: Record<ConnectionState, string> = {
  open: "CONECTADO",
  connecting: "Conectando",
  close: "Desconectado",
  unknown: "Verificando…",
};

const STATE_DOT: Record<ConnectionState, string> = {
  open: "bg-[#14e478]",
  connecting: "bg-[#2ae5dc]",
  close: "bg-[#fe924b]",
  unknown: "bg-slate-400",
};

const STEPS = [
  "Abre WhatsApp en tu dispositivo móvil habitual.",
  "Ve a Configuración › Dispositivos vinculados › Vincular un dispositivo.",
  "Apunta la cámara al código QR que ves en pantalla.",
];

interface QRPanelProps {
  initialState: "connected" | "disconnected" | "unknown";
}

export default function QRPanel({ initialState }: QRPanelProps) {
  const [state, setState] = useState<ConnectionState>(
    initialState === "connected" ? "open" : initialState === "disconnected" ? "close" : "unknown"
  );
  const [loading, setLoading] = useState(initialState !== "connected");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/instance/status");
      if (!res.ok) return;
      const data = await res.json();
      setState(data.state ?? "unknown");
    } catch {
      // silent — polling will retry
    }
  }, []);

  const initSession = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/whatsapp/instance/create", { method: "POST" });
      await fetchStatus();
      const qrRes = await fetch("/api/whatsapp/instance/qr");
      if (!qrRes.ok) return;
      const { qr } = await qrRes.json();
      if (qr) setQrImage(qr);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    if (state !== "open") initSession();
    intervalRef.current = setInterval(fetchStatus, 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isConnected = state === "open";

  return (
    <div className="grid gap-6 rounded-[1.5rem] border border-white/8 bg-white/3 p-6 lg:grid-cols-3 lg:p-8">
      {/* Left column */}
      <div className="flex flex-col justify-center gap-5">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
          <span className={`size-2 rounded-full ${STATE_DOT[state]}`} />
          {STATE_LABELS[state]}
        </span>

        {isConnected ? (
          <>
            <div>
              <p className="text-xl font-semibold text-white">Sesión activa y lista</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Tu número está vinculado correctamente. Puedes comenzar a agendar tus mensajes ahora mismo.
              </p>
            </div>
            <Button render={<Link href="/schedule" />} nativeButton={false} className="self-start gap-2">
              Agendar mensaje <ArrowRight className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className="text-xl font-semibold text-white">Conecta tu sesión de WhatsApp</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Escanea el código desde tu teléfono para habilitar los envíos programados en este espacio.
              </p>
            </div>
            <Button variant="outline" onClick={initSession} disabled={loading} className="self-start gap-2">
              <RefreshCcw className="size-4" />
              Actualizar QR
            </Button>
          </>
        )}
      </div>

      {/* Center column */}
      <div className="flex items-center justify-center">
        {isConnected ? (
          <div className="flex size-44 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(42,229,220,0.35),rgba(20,228,120,0.2))] shadow-[0_0_60px_rgba(42,229,220,0.2)]">
            <div className="flex size-28 items-center justify-center rounded-[1.8rem] border border-white/20 bg-white/10 backdrop-blur-sm">
              <CheckCircle2 className="size-12 text-[#14e478]" />
            </div>
          </div>
        ) : loading ? (
          <Skeleton className="size-60 rounded-2xl" />
        ) : qrImage ? (
          <img
            src={qrImage}
            alt="Código QR para conectar WhatsApp"
            width={240}
            height={240}
            className="rounded-2xl border border-white/10 bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          />
        ) : null}
      </div>

      {/* Right column */}
      <div className="flex flex-col justify-center">
        {isConnected ? (
          <div className="space-y-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Resumen de conexión
            </p>
            <div className="flex items-start gap-3">
              <RefreshCcw className="mt-0.5 size-4 shrink-0 text-[#2ae5dc]" />
              <div>
                <p className="text-xs text-slate-400">Última sincronización</p>
                <p className="text-sm font-semibold text-white">Ahora</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-base font-semibold text-white">Cómo hacerlo sin fricción</p>
            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#2ae5dc]/30 bg-[#2ae5dc]/10 text-xs font-bold text-[#2ae5dc]">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
