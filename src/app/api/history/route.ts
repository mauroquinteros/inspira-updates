import { NextRequest, NextResponse } from "next/server";
import { listHistoryMessages } from "@/db/scheduledMessages";

const VALID_STATUSES = ["scheduled", "sent", "failed", "cancelled"];

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") ?? undefined;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 }
    );
  }

  const messages = await listHistoryMessages(status);
  return NextResponse.json(messages);
}
