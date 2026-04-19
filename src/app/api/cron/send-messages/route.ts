import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  getDueMessagesWithOwnerInstance,
  updateMessageStatus,
} from "@/db/scheduledMessages";
import { insertMessageExecution } from "@/db/messageExecutions";
import { sendTextMessage } from "@/lib/evolutionClient";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dueMessages = await getDueMessagesWithOwnerInstance();

    let sent = 0;
    let failed = 0;

    for (const message of dueMessages) {
      try {
        const payload = await sendTextMessage(
          message.instance_name,
          message.group_jid,
          message.content,
        );

        await insertMessageExecution(message.id, "sent", payload);
        await updateMessageStatus(message.id, "sent", new Date());
        sent++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(
          `[cron] Failed to send message ${message.id}:`,
          errorMessage,
        );

        await insertMessageExecution(
          message.id,
          "failed",
          undefined,
          errorMessage,
        );
        await updateMessageStatus(message.id, "failed");
        failed++;
      }
    }

    return NextResponse.json({
      processed: dueMessages.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("[GET /api/cron/send-messages]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
