"use client";

interface Props {
  date: Date | string | null;
  relative?: boolean;
  fallback?: string;
}

export function FormattedDate({ date, relative = false, fallback = "—" }: Props) {
  if (!date) return <>{fallback}</>;
  const d = new Date(date);

  if (relative) {
    const now = new Date();
    const diffDays = Math.floor((d.getTime() - now.getTime()) / 86400000);
    if (diffDays === 0) {
      return <>Hoy, {d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</>;
    }
    if (diffDays === 1) return <>Mañana</>;
    return <>{d.toLocaleDateString("es-PE", { dateStyle: "medium" })}</>;
  }

  return <>{d.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</>;
}
