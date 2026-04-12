import { NextResponse } from "next/server";
import { getQR } from "@/lib/evolutionClient";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const { code, pairingCode } = await getQR(env.EVOLUTION_INSTANCE_NAME);
    return NextResponse.json({ qr: code, pairingCode });
  } catch (error) {
    console.error("[GET /api/whatsapp/instance/qr]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
