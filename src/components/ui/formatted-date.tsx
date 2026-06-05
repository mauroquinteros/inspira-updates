"use client";

import { useSyncExternalStore } from "react";

interface Props {
  date: Date | string | null;
  relative?: boolean;
  fallback?: string;
}

// Devuelve false durante SSR y el primer render de hidratación, true después.
// Es el patrón recomendado por React para diferencias SSR/cliente sin setState
// dentro de un efecto.
const subscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export function FormattedDate({ date, relative = false, fallback = "—" }: Props) {
  // El formateo por locale (Intl) y el cálculo relativo dependen de la zona
  // horaria del runtime, que difiere entre el server (SSR) y el navegador.
  // Para evitar el mismatch de hidratación, durante SSR y el primer render del
  // cliente no formateamos nada; recién tras hidratar mostramos la fecha real.
  const mounted = useHydrated();

  if (!date) return <>{fallback}</>;
  // Placeholder neutro hasta montar (no el fallback de fecha nula, para no
  // mostrar "Sin envíos" por un instante cuando sí hay fecha).
  if (!mounted) return <>&nbsp;</>;

  const d = new Date(date);

  if (relative) {
    const time = d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

    // Diferencia por día de CALENDARIO: aplano ambas fechas a su medianoche local
    // y resto, para que "mañana 1pm" cuente como 1 día aunque falten <24h.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfDate = new Date(d);
    startOfDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((startOfDate.getTime() - startOfToday.getTime()) / 86400000);

    if (diffDays === 0) return <>Hoy, {time}</>;
    if (diffDays === 1) return <>Mañana, {time}</>;
    return <>{d.toLocaleDateString("es-PE", { dateStyle: "medium" })}, {time}</>;
  }

  return <>{d.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</>;
}
