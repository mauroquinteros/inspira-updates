import { NextRequest, NextResponse } from "next/server";
import { cancelMessage } from "@/db/scheduledMessages";
import { db } from "@/db/client";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if message exists at all first
    const existing = await db<{ id: string; status: string }[]>`
      SELECT id, status FROM scheduled_messages WHERE id = ${id}
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

    const cancelled = await cancelMessage(id);
    if (!cancelled) {
      // Race condition: status changed between check and update
      return NextResponse.json(
        { error: "Message could not be cancelled" },
        { status: 409 }
      );
    }

    return NextResponse.json(cancelled);
  } catch (error) {
    console.error("[DELETE /api/scheduled-messages/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
