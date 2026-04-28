import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { cancelMessage } from "@/db/scheduledMessages";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const DELETE = authorizeRoute<{ id: string }>(async ({ user, params }) => {
  const { id } = await params;

  const existing = await db<{ id: string; status: string }[]>`
    SELECT id, status
    FROM scheduled_messages
    WHERE id = ${id}
      AND user_id = ${user.id}
  `;

  if (existing.length === 0) {
    return NextResponse.json({ error: "No encontramos el mensaje solicitado." }, { status: 404 });
  }

  if (existing[0].status !== "scheduled") {
    return NextResponse.json({ error: `Solo puedes cancelar mensajes programados. Estado actual: ${existing[0].status}.` }, { status: 409 });
  }

  const cancelled = await cancelMessage(user.id, id);
  if (!cancelled) {
    return NextResponse.json({ error: "No pudimos cancelar el mensaje porque su estado cambió." }, { status: 409 });
  }

  return NextResponse.json(cancelled);
}, { logLabel: "[DELETE /api/scheduled-messages/[id]]" });
