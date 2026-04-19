import { db } from "@/db/client";

export interface AppUser {
  id: string;
  auth_user_id: string;
  email: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function findUserByAuthUserId(
  authUserId: string
): Promise<AppUser | null> {
  const rows = await db<AppUser[]>`
    SELECT *
    FROM users
    WHERE auth_user_id = ${authUserId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function upsertUser(
  authUserId: string,
  email: string,
  name?: string | null
): Promise<AppUser> {
  const rows = await db<AppUser[]>`
    INSERT INTO users (auth_user_id, email, name)
    VALUES (${authUserId}, ${email}, ${name ?? null})
    ON CONFLICT (auth_user_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      updated_at = NOW()
    RETURNING *
  `;

  return rows[0];
}
