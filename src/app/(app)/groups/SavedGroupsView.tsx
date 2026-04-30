"use client";

import { useState } from "react";
import { Plus, ShieldCheck, Sparkles, Zap } from "lucide-react";

import type { SavedGroup } from "@/db/savedGroups";
import SavedGroupsList from "./SavedGroupsList";
import AddGroupModal from "./AddGroupModal";
import { Button } from "@/components/ui/button";

interface Props {
  initialGroups: SavedGroup[];
}

const FEATURE_CARDS = [
  {
    icon: ShieldCheck,
    title: "Privacidad Total",
    body: "Tus grupos y mensajes están cifrados. Solo tú tienes acceso a los identificadores.",
  },
  {
    icon: Sparkles,
    title: "Importación Inteligente",
    body: "Sincronizamos automáticamente tus grupos más activos para ahorrarte tiempo.",
  },
  {
    icon: Zap,
    title: "Acciones Masivas",
    body: "Próximamente: Activa o desactiva múltiples grupos con un solo clic.",
  },
];

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

  const activeCount = groups.filter((g) => g.is_active).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Gestión de grupos</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Importa grupos desde tu sesión de WhatsApp y decide cuáles quedan activos para los próximos envíos.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <span className="size-2 rounded-full bg-[#2ae5dc]" />
            {activeCount} activos · {groups.length} en total
          </span>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Agregar grupo
          </Button>
        </div>
      </div>

      {/* Group library card */}
      <SavedGroupsList groups={groups} onToggle={handleToggle} onRemove={handleRemove} />

      {/* Feature cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {FEATURE_CARDS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-[1.5rem] border border-white/8 bg-white/3 p-6">
            <Icon className="size-6 text-[#2ae5dc]" />
            <p className="mt-4 text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{body}</p>
          </div>
        ))}
      </div>

      <AddGroupModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
