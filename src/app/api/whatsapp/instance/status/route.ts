import { NextResponse } from "next/server";
import { getConnectionState } from "@/lib/evolutionClient";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const GET = authorizeRoute(async ({ user }) => {
  const instance = await getOrCreateEvolutionInstance(user.id);

  const data = await getConnectionState(instance.instance_name);
  return NextResponse.json({ state: data.instance.state });
}, { logLabel: "[GET /api/whatsapp/instance/status]" });
