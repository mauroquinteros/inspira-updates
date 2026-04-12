import { NextResponse } from "next/server";
import { fetchAllGroups, getConnectionState } from "@/lib/evolutionClient";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const stateData = await getConnectionState(env.EVOLUTION_INSTANCE_NAME);
    if (stateData.instance.state !== "open") {
      return NextResponse.json(
        { error: "whatsapp_disconnected" },
        { status: 503 }
      );
    }

    const groups = await fetchAllGroups(env.EVOLUTION_INSTANCE_NAME);
    return NextResponse.json(groups);
  } catch (error) {
    console.error("[GET /api/whatsapp/groups]", error);
    return NextResponse.json(
      { error: "evolution_api_unavailable" },
      { status: 502 }
    );
  }
}
