import { randomUUID } from "crypto";
import { db } from "@/db/client";

export interface EvolutionInstance {
  id: string;
  user_id: string;
  instance_name: string;
  status: "pending" | "connected" | "disconnected";
  created_at: Date;
  updated_at: Date;
}

function generateInstanceName(): string {
  return `evo_${randomUUID().replace(/-/g, "")}`;
}

export async function getEvolutionInstanceByUserId(
  userId: string
): Promise<EvolutionInstance | null> {
  const rows = await db<EvolutionInstance[]>`
    SELECT *
    FROM evolution_instances
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getOrCreateEvolutionInstance(
  userId: string
): Promise<EvolutionInstance> {
  const existing = await getEvolutionInstanceByUserId(userId);
  if (existing) {
    return existing;
  }

  const rows = await db<EvolutionInstance[]>`
    INSERT INTO evolution_instances (user_id, instance_name, status)
    VALUES (${userId}, ${generateInstanceName()}, 'pending')
    RETURNING *
  `;

  return rows[0];
}
