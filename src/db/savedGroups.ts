import { db } from "@/db/client";

export interface SavedGroup {
  id: string;
  user_id: string;
  group_jid: string;
  group_name: string;
  is_active: boolean;
  created_at: Date;
  deleted_at: Date | null;
}

export async function insertSavedGroup(
  user_id_or_group_jid: string,
  group_jid_or_group_name: string,
  maybe_group_name?: string
): Promise<SavedGroup | null> {
  const user_id = maybe_group_name ? user_id_or_group_jid : null;
  const group_jid = maybe_group_name ? group_jid_or_group_name : user_id_or_group_jid;
  const group_name = maybe_group_name ?? group_jid_or_group_name;

  // Upsert with resurrection: a brand-new group is inserted; re-adding a group
  // that was archived (soft-deleted) un-archives it and returns the revived row.
  // Re-adding a group that is already active hits the ON CONFLICT WHERE guard,
  // which updates nothing and returns no row -> null -> caller responds 409.
  const rows = await db<SavedGroup[]>`
    INSERT INTO saved_groups (user_id, group_jid, group_name, is_active)
    VALUES (${user_id}, ${group_jid}, ${group_name}, true)
    ON CONFLICT (user_id, group_jid) DO UPDATE
      SET deleted_at = NULL,
          is_active = true,
          group_name = EXCLUDED.group_name
      WHERE saved_groups.deleted_at IS NOT NULL
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function listSavedGroups(user_id?: string): Promise<SavedGroup[]> {
  if (user_id) {
    return db<SavedGroup[]>`
      SELECT *
      FROM saved_groups
      WHERE user_id = ${user_id}
        AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;
  }

  return db<SavedGroup[]>`
    SELECT *
    FROM saved_groups
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `;
}

export async function toggleSavedGroup(
  user_id_or_id: string,
  id_or_is_active: string | boolean,
  maybe_is_active?: boolean
): Promise<SavedGroup | null> {
  const user_id = typeof id_or_is_active === "string" ? user_id_or_id : null;
  const id = typeof id_or_is_active === "string" ? id_or_is_active : user_id_or_id;
  const is_active =
    typeof id_or_is_active === "string" ? maybe_is_active ?? false : id_or_is_active;

  if (user_id) {
    const rows = await db<SavedGroup[]>`
      UPDATE saved_groups
      SET is_active = ${is_active}
      WHERE id = ${id}
        AND user_id = ${user_id}
      RETURNING *
    `;
    return rows[0] ?? null;
  }

  const rows = await db<SavedGroup[]>`
    UPDATE saved_groups
    SET is_active = ${is_active}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ?? null;
}

/** Counts a group's pending ('scheduled') messages — the ones archiving will cancel. */
export async function countPendingMessages(
  user_id: string,
  group_id: string
): Promise<number> {
  const rows = await db<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM scheduled_messages
    WHERE group_id = ${group_id}
      AND user_id = ${user_id}
      AND status = 'scheduled'
  `;
  return rows[0]?.count ?? 0;
}

/**
 * Soft-deletes (archives) a group and cancels its pending messages atomically.
 * Returns false if no active group matched (already archived or not owned).
 * Sent/failed/cancelled messages are left untouched so History stays intact.
 */
export async function archiveSavedGroup(
  user_id: string,
  id: string
): Promise<boolean> {
  return db.begin(async (sql) => {
    const archived = await sql`
      UPDATE saved_groups
      SET deleted_at = NOW()
      WHERE id = ${id}
        AND user_id = ${user_id}
        AND deleted_at IS NULL
    `;

    if (archived.count === 0) return false;

    await sql`
      UPDATE scheduled_messages
      SET status = 'cancelled',
          updated_at = NOW()
      WHERE group_id = ${id}
        AND user_id = ${user_id}
        AND status = 'scheduled'
    `;

    return true;
  });
}
