-- Soft delete for saved_groups.
--
-- Why: deleting a saved group hard-fails on the RESTRICT foreign key
-- scheduled_messages.group_id -> saved_groups(id) whenever the group has ANY
-- referencing message (scheduled/sent/failed/cancelled). Rather than cascade
-- destroy the message history (which the History view depends on), "Eliminar"
-- now archives the group: it is hidden from the library but its rows — and the
-- audit trail in History — stay intact.
--
-- deleted_at IS NULL  -> active group.
-- deleted_at IS NOT NULL -> archived (hidden). Re-adding the same group_jid
-- resurrects it (see insertSavedGroup upsert).
--
-- Idempotent: the migrate runner re-executes every .sql file on each run, so
-- ADD COLUMN IF NOT EXISTS guards against re-applying. Type is timestamptz to
-- match the timezone convention established in 003.
ALTER TABLE saved_groups
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Speeds up the active-groups listing (WHERE deleted_at IS NULL), used on the
-- groups, schedule, inicio and history pages.
CREATE INDEX IF NOT EXISTS saved_groups_deleted_at_idx
  ON saved_groups (deleted_at);
