"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
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
      {FILTERS.map((f) => (
        <Button
          key={f.value}
          variant="ghost"
          size="sm"
          onClick={() => handleFilter(f.value)}
          className={
            active === f.value
              ? "font-mono text-xs bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700"
              : "font-mono text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
          }
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
