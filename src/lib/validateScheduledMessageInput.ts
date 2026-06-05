import { NextResponse } from "next/server";

import { db } from "@/db/client";

export type ScheduledMessageInput = {
  content?: string;
  scheduled_for?: string;
  group_id?: string;
};

type ValidationResult =
  | { ok: false; response: Response }
  | { ok: true; data: { content: string; scheduledDate: Date; group_id: string } };

/**
 * Shared validation for creating and editing a scheduled message:
 * content required, send time in the future, and the group must exist,
 * belong to the user, and be active. Returns a ready-to-send error
 * response on failure, or the cleaned values on success.
 */
export async function validateScheduledMessageInput(
  user_id: string,
  input: ScheduledMessageInput
): Promise<ValidationResult> {
  const { content, scheduled_for, group_id } = input;

  if (!content || content.trim() === "") {
    return {
      ok: false,
      response: NextResponse.json({ error: "El contenido del mensaje es obligatorio." }, { status: 400 }),
    };
  }

  if (!scheduled_for) {
    return {
      ok: false,
      response: NextResponse.json({ error: "La fecha y hora de envío son obligatorias." }, { status: 400 }),
    };
  }

  const scheduledDate = new Date(scheduled_for);
  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    return {
      ok: false,
      response: NextResponse.json({ error: "La fecha de envío debe ser futura." }, { status: 400 }),
    };
  }

  if (!group_id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Debes seleccionar un grupo." }, { status: 400 }),
    };
  }

  const groups = await db<{ id: string; is_active: boolean }[]>`
    SELECT id, is_active
    FROM saved_groups
    WHERE id = ${group_id}
      AND user_id = ${user_id}
  `;

  if (groups.length === 0) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No encontramos el grupo seleccionado." }, { status: 404 }),
    };
  }

  if (!groups[0].is_active) {
    return {
      ok: false,
      response: NextResponse.json({ error: "El grupo seleccionado está desactivado." }, { status: 400 }),
    };
  }

  return { ok: true, data: { content: content.trim(), scheduledDate, group_id } };
}
