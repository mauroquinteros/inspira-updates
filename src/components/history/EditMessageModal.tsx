"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SavedGroup } from "@/db/savedGroups";
import type { HistoryMessage } from "@/db/scheduledMessages";
import EditMessageForm from "./EditMessageForm";

interface EditMessageModalProps {
  message: HistoryMessage | null;
  activeGroups: SavedGroup[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditMessageModal({ message, activeGroups, onClose, onSaved }: EditMessageModalProps) {
  return (
    <Dialog open={!!message} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar mensaje programado</DialogTitle>
        </DialogHeader>
        {message ? (
          <EditMessageForm
            message={message}
            activeGroups={activeGroups}
            onCancel={onClose}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
