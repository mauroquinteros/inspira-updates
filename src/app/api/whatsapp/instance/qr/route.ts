import { NextResponse } from "next/server";
import { getQR } from "@/lib/evolutionClient";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { requireAppUser } from "@/lib/currentUser";

export async function GET() {
  try {
    const user = await requireAppUser();
    const instance = await getOrCreateEvolutionInstance(user.id);

    const { code, pairingCode } = await getQR(instance.instance_name);
    return NextResponse.json({ qr: code, pairingCode });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/whatsapp/instance/qr]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
