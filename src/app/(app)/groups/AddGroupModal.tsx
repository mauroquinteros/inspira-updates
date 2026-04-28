"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Search, UsersRound } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

  const filtered = groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase()));

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar grupo</DialogTitle>
          <DialogDescription>Busca entre los grupos disponibles de tu sesión conectada y guárdalos para futuras campañas.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="buscar-grupo" className="text-sm font-medium text-slate-200">Buscar grupo</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="buscar-grupo"
                placeholder="Escribe el nombre del grupo"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>No pudimos completar la carga</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-16 w-full rounded-[1.2rem]" />)
              : null}

            {!loading && !error && filtered.length === 0 ? (
              <div className="rounded-[1.35rem] border border-dashed border-white/12 bg-white/3 py-10 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/4 text-slate-300">
                  <UsersRound className="size-5" />
                </div>
                <p className="mt-4 text-sm font-medium text-white">No encontramos coincidencias.</p>
                <p className="mt-2 text-sm text-slate-400">Prueba con otro nombre o revisa tu conexión.</p>
              </div>
            ) : null}

            {!loading &&
              filtered.map((group) => {
                const alreadySaved = savedJids.has(group.jid);
                return (
                  <div key={group.jid} className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/8 bg-white/4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{group.name}</p>
                      <p className="truncate font-mono text-xs text-slate-400">{group.jid}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={alreadySaved ? "secondary" : "outline"}
                      disabled={saving === group.jid || alreadySaved}
                      onClick={() => handleSave(group)}
                    >
                      {saving === group.jid ? <LoaderCircle className="size-4 animate-spin" /> : null}
                      {alreadySaved ? "Guardado" : saving === group.jid ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                );
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
