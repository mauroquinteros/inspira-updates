import { NextRequest, NextResponse } from "next/server";
import { insertScheduledMessage, listScheduledMessages } from "@/db/scheduledMessages";
import { db } from "@/db/client";

export async function GET() {
  try {
    const messages = await listScheduledMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("[GET /api/scheduled-messages]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
      SELECT id, is_active FROM saved_groups WHERE id = ${group_id}
    `;

    if (groups.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 400 });
    }

    if (!groups[0].is_active) {
      return NextResponse.json(
        { error: "Group is inactive" },
        { status: 400 }
      );
    }

    const message = await insertScheduledMessage(group_id, content.trim(), scheduledDate);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[POST /api/scheduled-messages]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
