import { NextResponse } from "next/server";
import { createInstance } from "@/lib/evolutionClient";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const POST = authorizeRoute(async ({ user }) => {
  const instance = await getOrCreateEvolutionInstance(user.id);

  await createInstance(instance.instance_name);
  return NextResponse.json({ ok: true });
}, { logLabel: "[POST /api/whatsapp/instance/create]" });
