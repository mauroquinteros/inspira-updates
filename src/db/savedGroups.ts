import { db } from "@/db/client";

export interface SavedGroup {
  id: string;
  group_jid: string;
  group_name: string;
  is_active: boolean;
  created_at: Date;
}

export async function insertSavedGroup(
  group_jid: string,
  group_name: string
): Promise<SavedGroup | null> {
  try {
    const rows = await db<SavedGroup[]>`
      INSERT INTO saved_groups (group_jid, group_name, is_active)
      VALUES (${group_jid}, ${group_name}, true)
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

export async function listSavedGroups(): Promise<SavedGroup[]> {
  return db<SavedGroup[]>`
    SELECT * FROM saved_groups ORDER BY created_at DESC
  `;
}

export async function toggleSavedGroup(
  id: string,
  is_active: boolean
): Promise<SavedGroup | null> {
  const rows = await db<SavedGroup[]>`
    UPDATE saved_groups SET is_active = ${is_active} WHERE id = ${id} RETURNING *
  `;
  return rows[0] ?? null;
}

export async function deleteSavedGroup(id: string): Promise<boolean> {
  const result = await db`
    DELETE FROM saved_groups WHERE id = ${id}
  `;
  return result.count > 0;
}
