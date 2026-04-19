import { NextResponse } from "next/server";
import { createInstance } from "@/lib/evolutionClient";
import { getOrCreateEvolutionInstance } from "@/db/evolutionInstances";
import { requireAppUser } from "@/lib/currentUser";

export async function POST() {
  try {
    const user = await requireAppUser();
    const instance = await getOrCreateEvolutionInstance(user.id);

    await createInstance(instance.instance_name);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/whatsapp/instance/create]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
