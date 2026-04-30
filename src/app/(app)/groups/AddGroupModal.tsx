"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Search, UserPlus2, UsersRound, X } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SavedGroup } from "@/db/savedGroups";

interface EvolutionGroup {
  jid: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (group: SavedGroup) => void;
}

export default function AddGroupModal({ open, onClose, onAdd }: Props) {
  const [groups, setGroups] = useState<EvolutionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [savedJids, setSavedJids] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setError(null);
    setGroups([]);
    setLoading(true);

    fetch("/api/whatsapp/groups")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          if (res.status === 503) throw new Error("Tu WhatsApp aún no está conectado. Vincúlalo primero.");
          throw new Error(body.error ?? `No pudimos cargar tus grupos (${res.status}).`);
        }
        return res.json() as Promise<EvolutionGroup[]>;
      })
      .then(setGroups)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.jid.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(group: EvolutionGroup) {
    setSaving(group.jid);
    try {
      const res = await fetch("/api/saved-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_jid: group.jid, group_name: group.name }),
      });

      if (res.status === 409) {
        setSavedJids((prev) => new Set(prev).add(group.jid));
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No pudimos guardar este grupo.");
      }

      const saved: SavedGroup = await res.json();
      setSavedJids((prev) => new Set(prev).add(group.jid));
      onAdd(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar el grupo.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 p-0 sm:max-w-xl !bg-[#1A1A3E] !backdrop-blur-none [&>button]:hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-6 py-5">
          <div className="flex items-center gap-3">
            <UserPlus2 className="size-5 text-[#2ae5dc]" />
            <span className="text-xl font-semibold text-white">Agregar grupo</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
          {/* Search */}
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar grupos por nombre o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-white/8 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#2ae5dc]/50"
            />
          </div>

          {/* Loading hint */}
          {loading && (
            <p className="shrink-0 text-center text-sm leading-5 text-slate-400">
              La primera sincronización puede tardar unos segundos — WhatsApp procesa todos tus grupos antes de enviárnoslos.
            </p>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive" className="shrink-0">
              <AlertTitle>No pudimos completar la carga</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Group list */}
          <div className="space-y-2">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/4" />
              ))}

            {!loading && !error && filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/12 bg-white/3 py-10 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/4 text-slate-300">
                  <UsersRound className="size-5" />
                </div>
                <p className="mt-4 text-sm font-medium text-white">No encontramos coincidencias.</p>
                <p className="mt-1 text-sm text-slate-400">Prueba con otro nombre o revisa tu conexión.</p>
              </div>
            )}

            {!loading &&
              filtered.map((group) => {
                const alreadySaved = savedJids.has(group.jid);
                const isSaving = saving === group.jid;
                return (
                  <div
                    key={group.jid}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/6 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{group.name}</p>
                      <p className="truncate font-mono text-xs text-slate-400">ID: {group.jid}</p>
                    </div>
                    <button
                      disabled={isSaving || alreadySaved}
                      onClick={() => handleSave(group)}
                      className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
                        alreadySaved
                          ? "border border-[#2ae5dc] bg-transparent text-[#2ae5dc]"
                          : "bg-[#2ae5dc] text-[#040535] hover:bg-[#2ae5dc]/80"
                      }`}
                    >
                      {isSaving ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : alreadySaved ? (
                        "Guardado"
                      ) : (
                        "Guardar"
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-white/8 px-6 py-4">
          <button
            onClick={onClose}
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
