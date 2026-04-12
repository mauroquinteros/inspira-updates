"use client";

import { useState } from "react";
import { SavedGroup } from "@/db/savedGroups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="rounded border border-slate-800 bg-slate-900 py-12 text-center">
        <p className="text-sm text-slate-500">No groups saved yet.</p>
        <p className="text-xs text-slate-600 mt-1">
          Click &ldquo;+ Add Group&rdquo; to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded border border-slate-800 bg-slate-900 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-400 text-xs uppercase tracking-widest font-medium">
              Name
            </TableHead>
            <TableHead className="text-slate-400 text-xs uppercase tracking-widest font-medium hidden sm:table-cell">
              JID
            </TableHead>
            <TableHead className="text-slate-400 text-xs uppercase tracking-widest font-medium">
              Status
            </TableHead>
            <TableHead className="text-slate-400 text-xs uppercase tracking-widest font-medium text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow
              key={group.id}
              className="border-slate-800 hover:bg-slate-800/50"
            >
              <TableCell className="text-slate-100 text-sm font-medium">
                {group.group_name}
              </TableCell>
              <TableCell className="text-slate-500 text-xs font-mono hidden sm:table-cell">
                {group.group_jid}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    group.is_active
                      ? "bg-emerald-600 text-white border-0 text-xs"
                      : "bg-slate-700 text-slate-400 border-0 text-xs"
                  }
                >
                  {group.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingToggle === group.id}
                    onClick={() => handleToggle(group)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 text-xs h-7 px-2"
                  >
                    {loadingToggle === group.id
                      ? "…"
                      : group.is_active
                      ? "Deactivate"
                      : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingRemove === group.id}
                    onClick={() => handleRemove(group.id)}
                    className="border-red-900 text-red-400 hover:bg-red-950 hover:text-red-300 text-xs h-7 px-2"
                  >
                    {loadingRemove === group.id ? "…" : "Remove"}
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
