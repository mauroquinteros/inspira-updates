import { NextResponse } from "next/server";

import { insertScheduledMessage, listScheduledMessages } from "@/db/scheduledMessages";
import { authorizeRoute } from "@/lib/authorizeRoute";
import { validateScheduledMessageInput } from "@/lib/validateScheduledMessageInput";

export const GET = authorizeRoute(async ({ user }) => {
  const messages = await listScheduledMessages(user.id);
  return NextResponse.json(messages);
}, { logLabel: "[GET /api/scheduled-messages]" });

export const POST = authorizeRoute(async ({ request, user }) => {
  const body = await request.json();

  const validation = await validateScheduledMessageInput(user.id, body);
  if (!validation.ok) {
    return validation.response;
  }

  const { content, scheduledDate, group_id } = validation.data;
  const message = await insertScheduledMessage(user.id, group_id, content, scheduledDate);
  return NextResponse.json(message, { status: 201 });
}, { logLabel: "[POST /api/scheduled-messages]" });
