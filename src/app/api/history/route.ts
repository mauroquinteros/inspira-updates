import { NextRequest, NextResponse } from "next/server";
import { listHistoryMessages } from "@/db/scheduledMessages";
import { requireAppUser } from "@/lib/currentUser";

const VALID_STATUSES = ["scheduled", "sent", "failed", "cancelled"];

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") ?? undefined;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 }
    );
  }

  try {
    const user = await requireAppUser(request);
    const messages = await listHistoryMessages(user.id, status);
    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/history]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
