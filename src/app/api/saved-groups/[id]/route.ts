import { NextRequest, NextResponse } from "next/server";
import { toggleSavedGroup, deleteSavedGroup } from "@/db/savedGroups";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { is_active } = body as { is_active: boolean };

    const updated = await toggleSavedGroup(id, is_active);
    if (updated === null) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/saved-groups/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteSavedGroup(id);
    if (!deleted) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/saved-groups/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
