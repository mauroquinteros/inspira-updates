"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/inicio", label: "Inicio" },
  { href: "/groups", label: "Grupos" },
  { href: "/schedule", label: "Programación" },
  { href: "/history", label: "Historial" },
];

export default function AppHeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="hidden items-center gap-8 lg:flex">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative pb-1 text-sm font-medium transition-colors",
              isActive
                ? "text-white after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#2ae5dc] after:content-['']"
                : "text-slate-400 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
