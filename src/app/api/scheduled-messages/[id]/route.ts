import { NextResponse } from "next/server";
import { cancelMessage } from "@/db/scheduledMessages";
import { db } from "@/db/client";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const DELETE = authorizeRoute<{ id: string }>(async ({ user, params }) => {
  const { id } = await params;

  // Check if message exists at all first
  const existing = await db<{ id: string; status: string }[]>`
    SELECT id, status
    FROM scheduled_messages
    WHERE id = ${id}
      AND user_id = ${user.id}
  `;

  if (existing.length === 0) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  if (existing[0].status !== "scheduled") {
    return NextResponse.json(
      { error: `Cannot cancel message with status '${existing[0].status}'` },
      { status: 409 }
    );
  }

  const cancelled = await cancelMessage(user.id, id);
  if (!cancelled) {
    // Race condition: status changed between check and update
    return NextResponse.json(
      { error: "Message could not be cancelled" },
      { status: 409 }
    );
  }

  return NextResponse.json(cancelled);
}, { logLabel: "[DELETE /api/scheduled-messages/[id]]" });
