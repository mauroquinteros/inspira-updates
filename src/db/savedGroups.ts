import { db } from "@/db/client";

export interface SavedGroup {
  id: string;
  user_id: string;
  group_jid: string;
  group_name: string;
  is_active: boolean;
  created_at: Date;
}

export async function insertSavedGroup(
  user_id_or_group_jid: string,
  group_jid_or_group_name: string,
  maybe_group_name?: string
): Promise<SavedGroup | null> {
  const user_id = maybe_group_name ? user_id_or_group_jid : null;
  const group_jid = maybe_group_name ? group_jid_or_group_name : user_id_or_group_jid;
  const group_name = maybe_group_name ?? group_jid_or_group_name;

  try {
    const rows = await db<SavedGroup[]>`
      INSERT INTO saved_groups (user_id, group_jid, group_name, is_active)
      VALUES (${user_id}, ${group_jid}, ${group_name}, true)
      RETURNING *
    `;
    return rows[0] ?? null;
  } catch (err: unknown) {
    // Postgres unique_violation error code = 23505
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      return null;
    }
    throw err;
  }
}

export async function listSavedGroups(user_id?: string): Promise<SavedGroup[]> {
  if (user_id) {
    return db<SavedGroup[]>`
      SELECT *
      FROM saved_groups
      WHERE user_id = ${user_id}
      ORDER BY created_at DESC
    `;
  }

  return db<SavedGroup[]>`
    SELECT *
    FROM saved_groups
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

export async function deleteSavedGroup(
  user_id_or_id: string,
  maybe_id?: string
): Promise<boolean> {
  const user_id = maybe_id ? user_id_or_id : null;
  const id = maybe_id ?? user_id_or_id;

  const result = user_id
    ? await db`
        DELETE FROM saved_groups
        WHERE id = ${id}
          AND user_id = ${user_id}
      `
    : await db`
        DELETE FROM saved_groups
        WHERE id = ${id}
      `;
  return result.count > 0;
}
