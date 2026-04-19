import { NextResponse } from "next/server";
import { fetchAllGroups, getConnectionState } from "@/lib/evolutionClient";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const GET = authorizeRoute(async ({ user }) => {
  const instance = await getOrCreateEvolutionInstance(user.id);

  const stateData = await getConnectionState(instance.instance_name);
  if (stateData.instance.state !== "open") {
    return NextResponse.json(
      { error: "whatsapp_disconnected" },
      { status: 503 }
    );
  }

  const groups = await fetchAllGroups(instance.instance_name);
  return NextResponse.json(groups);
}, {
  logLabel: "[GET /api/whatsapp/groups]",
  onError: (error) => {
    console.error("[GET /api/whatsapp/groups]", error);
    return NextResponse.json(
      { error: "evolution_api_unavailable" },
      { status: 502 }
    );
  },
});
