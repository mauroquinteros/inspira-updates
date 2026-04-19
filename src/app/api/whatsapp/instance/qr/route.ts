import { NextResponse } from "next/server";
import { getQR } from "@/lib/evolutionClient";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const GET = authorizeRoute(async ({ user }) => {
  const instance = await getOrCreateEvolutionInstance(user.id);

  const { code, pairingCode } = await getQR(instance.instance_name);
  return NextResponse.json({ qr: code, pairingCode });
}, { logLabel: "[GET /api/whatsapp/instance/qr]" });
