import { NextResponse } from "next/server";
import { fetchAllGroups, getConnectionState } from "@/lib/evolutionClient";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { requireAppUser } from "@/lib/currentUser";

export async function GET() {
  try {
    const user = await requireAppUser();
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
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/whatsapp/groups]", error);
    return NextResponse.json(
      { error: "evolution_api_unavailable" },
      { status: 502 }
    );
  }
}
