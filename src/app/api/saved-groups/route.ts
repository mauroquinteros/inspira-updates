import { NextRequest, NextResponse } from "next/server";
import { insertSavedGroup, listSavedGroups } from "@/db/savedGroups";
import { requireAppUser } from "@/lib/currentUser";

export async function GET() {
  try {
    const user = await requireAppUser();
    const groups = await listSavedGroups(user.id);
    return NextResponse.json(groups);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/saved-groups]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAppUser(req);
    const body = await req.json();
    const { group_jid, group_name } = body as {
      group_jid: string;
      group_name?: string;
    };

    if (!group_jid) {
      return NextResponse.json(
        { error: "group_jid is required" },
        { status: 400 }
      );
    }

    const inserted = await insertSavedGroup(
      user.id,
      group_jid,
      group_name ?? group_jid
    );

    if (inserted === null) {
      return NextResponse.json(
        { error: "group_already_saved" },
        { status: 409 }
      );
    }

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/saved-groups]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
