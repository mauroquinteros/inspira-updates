"use client";

import { useState } from "react";
import { Plus, UsersRound } from "lucide-react";

import type { SavedGroup } from "@/db/savedGroups";
import SavedGroupsList from "./SavedGroupsList";
import AddGroupModal from "./AddGroupModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const activeGroups = groups.filter((group) => group.is_active).length;

  return (
    <div className="space-y-5">
      <Card className="bg-white/5">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge className="bg-white/7 text-slate-100 border-white/10">Gestión de grupos</Badge>
              <div>
                <CardTitle className="text-2xl text-white">Mantén tus destinos listos para programar</CardTitle>
                <CardDescription>
                  Importa grupos desde tu sesión conectada y decide cuáles quedan activos para los próximos envíos.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {activeGroups} activos · {groups.length} en total
              </div>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="size-4" />
                Agregar grupo
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <span className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#2ae5dc]">
              <UsersRound className="size-5" />
            </span>
            Biblioteca de grupos
          </CardTitle>
          <CardDescription>Activa o desactiva grupos según la campaña que quieras lanzar.</CardDescription>
        </CardHeader>
        <CardContent>
          <SavedGroupsList groups={groups} onToggle={handleToggle} onRemove={handleRemove} />
        </CardContent>
      </Card>

      <AddGroupModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
