import { NextResponse } from "next/server";

import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { authorizeRoute } from "@/lib/authorizeRoute";
import { fetchAllGroups, getConnectionState } from "@/lib/evolutionClient";

export const GET = authorizeRoute(async ({ user }) => {
  const instance = await getOrCreateEvolutionInstance(user.id);

  const stateData = await getConnectionState(instance.instance_name);
  if (stateData.instance.state !== "open") {
    return NextResponse.json({ error: "Tu sesión de WhatsApp aún no está conectada." }, { status: 503 });
  }

  const groups = await fetchAllGroups(instance.instance_name);
  return NextResponse.json(groups);
}, {
  logLabel: "[GET /api/whatsapp/groups]",
  onError: (error) => {
    console.error("[GET /api/whatsapp/groups]", error);
    return NextResponse.json({ error: "No pudimos consultar tus grupos en Evolution API." }, { status: 502 });
  },
});
