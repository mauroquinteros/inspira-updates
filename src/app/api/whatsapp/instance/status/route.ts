import { NextResponse } from "next/server";
import { getConnectionState } from "@/lib/evolutionClient";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const data = await getConnectionState(env.EVOLUTION_INSTANCE_NAME);
    return NextResponse.json({ state: data.instance.state });
  } catch (error) {
    console.error("[GET /api/whatsapp/instance/status]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
