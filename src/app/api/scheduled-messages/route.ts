import { NextResponse } from "next/server";
import { insertScheduledMessage, listScheduledMessages } from "@/db/scheduledMessages";
import { db } from "@/db/client";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const GET = authorizeRoute(async ({ user }) => {
  const messages = await listScheduledMessages(user.id);
  return NextResponse.json(messages);
}, { logLabel: "[GET /api/scheduled-messages]" });

export const POST = authorizeRoute(async ({ request, user }) => {
  const body = await request.json();
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
}, { logLabel: "[POST /api/scheduled-messages]" });
