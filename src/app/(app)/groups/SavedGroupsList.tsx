"use client";

import { useState } from "react";
import { Info, MessageSquare, Trash2, UsersRound } from "lucide-react";

import type { SavedGroup } from "@/db/savedGroups";

interface Props {
  groups: SavedGroup[];
  onToggle: (id: string, is_active: boolean) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export default function SavedGroupsList({ groups, onToggle, onRemove }: Props) {
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);
  const [loadingRemove, setLoadingRemove] = useState<string | null>(null);

  async function handleToggle(group: SavedGroup) {
    setLoadingToggle(group.id);
    await onToggle(group.id, !group.is_active);
    setLoadingToggle(null);
  }

  async function handleRemove(id: string) {
    setLoadingRemove(id);
    await onRemove(id);
    setLoadingRemove(null);
  }

  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/3">
      {/* Card header */}
      <div className="flex items-center gap-4 border-b border-white/8 p-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[0.9rem] border border-white/10 bg-[#2ae5dc]/10 text-[#2ae5dc]">
          <UsersRound className="size-5" />
        </span>
        <div>
          <p className="text-base font-semibold text-white">Biblioteca de grupos</p>
          <p className="text-sm text-slate-400">Activa o desactiva grupos según la campaña que quieras lanzar.</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-white">Todavía no guardaste grupos.</p>
          <p className="mt-2 text-sm text-slate-400">Usa &quot;Agregar grupo&quot; para importar uno desde tu sesión conectada.</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_120px_180px] gap-4 border-b border-white/8 px-6 py-3">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Nombre</span>
            <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:block">Identificador</span>
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Estado</span>
            <span className="text-right text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Acciones</span>
          </div>

          {/* Rows */}
          {groups.map((group) => (
            <div
              key={group.id}
              className="grid grid-cols-[1fr_1fr_120px_180px] items-center gap-4 border-b border-white/8 px-6 py-4 last:border-b-0 hover:bg-white/3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="truncate text-sm font-medium text-white">{group.group_name}</span>
              </div>

              <span className="hidden truncate font-mono text-xs text-slate-400 sm:block">{group.group_jid}</span>

              <span className="inline-flex items-center gap-1.5 text-sm">
                <span className={`size-2 shrink-0 rounded-full ${group.is_active ? "bg-[#14e478]" : "bg-slate-500"}`} />
                <span className={group.is_active ? "text-[#8bf4b6]" : "text-slate-400"}>
                  {group.is_active ? "Activo" : "Desactivado"}
                </span>
              </span>

              <div className="flex items-center justify-end gap-4">
                <button
                  disabled={loadingToggle === group.id}
                  onClick={() => handleToggle(group)}
                  className="text-sm text-slate-300 transition-colors hover:text-white disabled:opacity-50"
                >
                  {loadingToggle === group.id ? "Actualizando..." : group.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  disabled={loadingRemove === group.id}
                  onClick={() => handleRemove(group.id)}
                  className="inline-flex items-center gap-1.5 text-sm text-[#fe924b] transition-colors hover:text-orange-300 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
