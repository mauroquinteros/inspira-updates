"use client";

import { useState } from "react";

import type { SavedGroup } from "@/db/savedGroups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  if (groups.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/3 py-12 text-center">
        <p className="text-sm font-medium text-white">Todavía no guardaste grupos.</p>
        <p className="mt-2 text-sm text-slate-400">Usa “Agregar grupo” para importar uno desde tu sesión conectada.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/4">
      <Table>
        <TableHeader>
          <TableRow className="border-white/8 hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-[0.24em] text-slate-400">Nombre</TableHead>
            <TableHead className="hidden text-xs uppercase tracking-[0.24em] text-slate-400 sm:table-cell">Identificador</TableHead>
            <TableHead className="text-xs uppercase tracking-[0.24em] text-slate-400">Estado</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-[0.24em] text-slate-400">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id} className="border-white/8 hover:bg-white/4">
              <TableCell className="text-sm font-medium text-white">{group.group_name}</TableCell>
              <TableCell className="hidden font-mono text-xs text-slate-400 sm:table-cell">{group.group_jid}</TableCell>
              <TableCell>
                <Badge className={group.is_active ? "bg-[#14e478]/12 text-[#8bf4b6] border-[#14e478]/20" : "bg-white/6 text-slate-300 border-white/10"}>
                  {group.is_active ? "Activo" : "Pausado"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingToggle === group.id}
                    onClick={() => handleToggle(group)}
                  >
                    {loadingToggle === group.id ? "Actualizando..." : group.is_active ? "Pausar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={loadingRemove === group.id}
                    onClick={() => handleRemove(group.id)}
                  >
                    {loadingRemove === group.id ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
