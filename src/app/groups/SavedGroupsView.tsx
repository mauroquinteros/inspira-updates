"use client";

import { useState } from "react";
import { SavedGroup } from "@/db/savedGroups";
import SavedGroupsList from "./SavedGroupsList";
import AddGroupModal from "./AddGroupModal";
import { Button } from "@/components/ui/button";

interface Props {
  initialGroups: SavedGroup[];
}

export default function SavedGroupsView({ initialGroups }: Props) {
  const [groups, setGroups] = useState<SavedGroup[]>(initialGroups);
  const [modalOpen, setModalOpen] = useState(false);

  function handleAdd(group: SavedGroup) {
    setGroups((prev) => [group, ...prev]);
  }

  async function handleToggle(id: string, is_active: boolean) {
    const res = await fetch(`/api/saved-groups/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    });
    if (!res.ok) return;
    const updated: SavedGroup = await res.json();
    setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/saved-groups/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-slate-100">
            Saved Groups
          </h1>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-0"
          >
            + Add Group
          </Button>
        </div>

        <SavedGroupsList
          groups={groups}
          onToggle={handleToggle}
          onRemove={handleRemove}
        />

        <AddGroupModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleAdd}
        />
      </div>
    </main>
  );
}
