import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { insertScheduledMessage, listScheduledMessages } from "@/db/scheduledMessages";
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
    return NextResponse.json({ error: "El contenido del mensaje es obligatorio." }, { status: 400 });
  }

  if (!scheduled_for) {
    return NextResponse.json({ error: "La fecha y hora de envío son obligatorias." }, { status: 400 });
  }

  const scheduledDate = new Date(scheduled_for);
  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    return NextResponse.json({ error: "La fecha de envío debe ser futura." }, { status: 400 });
  }

  if (!group_id) {
    return NextResponse.json({ error: "Debes seleccionar un grupo." }, { status: 400 });
  }

  const groups = await db<{ id: string; is_active: boolean }[]>`
    SELECT id, is_active
    FROM saved_groups
    WHERE id = ${group_id}
      AND user_id = ${user.id}
  `;

  if (groups.length === 0) {
    return NextResponse.json({ error: "No encontramos el grupo seleccionado." }, { status: 404 });
  }

  if (!groups[0].is_active) {
    return NextResponse.json({ error: "El grupo seleccionado está desactivado." }, { status: 400 });
  }

  const message = await insertScheduledMessage(user.id, group_id, content.trim(), scheduledDate);
  return NextResponse.json(message, { status: 201 });
}, { logLabel: "[POST /api/scheduled-messages]" });
