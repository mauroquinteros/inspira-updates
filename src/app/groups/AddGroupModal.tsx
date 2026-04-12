"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SavedGroup } from "@/db/savedGroups";

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
          if (res.status === 503)
            throw new Error("WhatsApp is not connected. Please connect first.");
          throw new Error(body.error ?? `Failed to load groups (${res.status})`);
        }
        return res.json() as Promise<EvolutionGroup[]>;
      })
      .then(setGroups)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
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

      if (!res.ok) throw new Error("Failed to save group");

      const saved: SavedGroup = await res.json();
      setSavedJids((prev) => new Set(prev).add(group.jid));
      onAdd(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 font-mono max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">
            Add Group
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-600"
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-h-64 overflow-y-auto space-y-1">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded bg-slate-800" />
            ))}

          {!loading && !error && filtered.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">
              No groups found.
            </p>
          )}

          {!loading &&
            filtered.map((group) => {
              const alreadySaved = savedJids.has(group.jid);
              return (
                <div
                  key={group.jid}
                  className="flex items-center justify-between rounded px-3 py-2 bg-slate-800 hover:bg-slate-750"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm text-slate-100 truncate">{group.name}</p>
                    <p className="text-xs text-slate-500 truncate">{group.jid}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving === group.jid || alreadySaved}
                    onClick={() => handleSave(group)}
                    className={
                      alreadySaved
                        ? "border-emerald-800 text-emerald-400 cursor-default"
                        : "border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                    }
                  >
                    {alreadySaved ? "Saved" : saving === group.jid ? "…" : "Save"}
                  </Button>
                </div>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
