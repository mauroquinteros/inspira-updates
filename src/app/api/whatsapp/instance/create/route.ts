import { NextResponse } from "next/server";
import { createInstance } from "@/lib/evolutionClient";
import { env } from "@/lib/env";

export async function POST() {
  try {
    await createInstance(env.EVOLUTION_INSTANCE_NAME);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/whatsapp/instance/create]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
