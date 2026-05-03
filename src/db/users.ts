import { db } from "@/db/client";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function upsertUser(
  id: string,
  email: string,
  name?: string | null
): Promise<AppUser> {
  const rows = await db<AppUser[]>`
    INSERT INTO users (id, email, name)
    VALUES (${id}::uuid, ${email}, ${name ?? null})
    ON CONFLICT (id)
    DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      updated_at = NOW()
    RETURNING *
  `;

  return rows[0];
}
