import { NextResponse } from "next/server";

import { listHistoryMessages } from "@/db/scheduledMessages";
import { authorizeRoute } from "@/lib/authorizeRoute";

const VALID_STATUSES = ["scheduled", "sent", "failed", "cancelled"];

export const GET = authorizeRoute(async ({ request, user }) => {
  const status = request.nextUrl.searchParams.get("status") ?? undefined;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "El filtro solicitado no es válido." }, { status: 400 });
  }

  const messages = await listHistoryMessages(user.id, status);
  return NextResponse.json(messages);
}, { logLabel: "[GET /api/history]" });
