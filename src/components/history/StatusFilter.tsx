"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

const FILTERS = [
  { label: "Todos", value: "" },
  { label: "Programados", value: "scheduled" },
  { label: "Enviados", value: "sent" },
  { label: "Con fallos", value: "failed" },
  { label: "Cancelados", value: "cancelled" },
];

interface StatusFilterProps {
  currentStatus?: string;
}

export default function StatusFilter({ currentStatus }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`/history?${params.toString()}`);
  }

  const active = currentStatus ?? "";

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <Button
          key={filter.value}
          variant={active === filter.value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleFilter(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
