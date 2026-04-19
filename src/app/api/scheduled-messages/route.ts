import { NextRequest, NextResponse } from "next/server";
import { insertScheduledMessage, listScheduledMessages } from "@/db/scheduledMessages";
import { db } from "@/db/client";
import { requireAppUser } from "@/lib/currentUser";

export async function GET() {
  try {
    const user = await requireAppUser();
    const messages = await listScheduledMessages(user.id);
    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/scheduled-messages]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAppUser(req);
    const body = await req.json();
    const { group_id, content, scheduled_for } = body as {
      group_id?: string;
      content?: string;
      scheduled_for?: string;
    };

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    if (!scheduled_for) {
      return NextResponse.json({ error: "scheduled_for is required" }, { status: 400 });
    }

    const scheduledDate = new Date(scheduled_for);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: "scheduled_for must be a future timestamp" },
        { status: 400 }
      );
    }

    if (!group_id) {
      return NextResponse.json({ error: "group_id is required" }, { status: 400 });
    }

    // Verify the group exists and is active
    const groups = await db<{ id: string; is_active: boolean }[]>`
      SELECT id, is_active
      FROM saved_groups
      WHERE id = ${group_id}
        AND user_id = ${user.id}
    `;

    if (groups.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (!groups[0].is_active) {
      return NextResponse.json(
        { error: "Group is inactive" },
        { status: 400 }
      );
    }

    const message = await insertScheduledMessage(
      user.id,
      group_id,
      content.trim(),
      scheduledDate
    );
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[POST /api/scheduled-messages]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
