"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LayoutGrid, MessageSquareShare, RadioTower, UsersRound, History } from "lucide-react";

import { cn } from "@/lib/utils";

const items: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/inicio", label: "Inicio", icon: LayoutGrid },
  { href: "/session", label: "Conexión", icon: RadioTower },
  { href: "/groups", label: "Grupos", icon: UsersRound },
  { href: "/schedule", label: "Programación", icon: MessageSquareShare },
  { href: "/history", label: "Historial", icon: History },
];

export default function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="space-y-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition-all duration-200",
              isActive
                ? "border-white/12 bg-gradient-to-r from-[#4740ff]/30 via-[#0f3994]/24 to-[#2ae5dc]/12 text-white shadow-[0_14px_34px_rgba(42,229,220,0.12)]"
                : "border-transparent bg-transparent text-slate-300 hover:border-white/8 hover:bg-white/4 hover:text-white"
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full border text-current",
                isActive ? "border-white/10 bg-white/10" : "border-white/8 bg-white/4"
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
