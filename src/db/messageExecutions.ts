import { db } from "@/db/client";

export interface MessageExecution {
  id: string;
  scheduled_message_id: string;
  status: "sent" | "failed";
  response_payload: unknown | null;
  error_message: string | null;
  executed_at: Date;
}

export async function insertMessageExecution(
  scheduled_message_id: string,
  status: "sent" | "failed",
  responsePayload?: unknown,
  errorMessage?: string
): Promise<MessageExecution> {
  const rows = await db<MessageExecution[]>`
    INSERT INTO message_executions (
      scheduled_message_id,
      status,
      response_payload,
      error_message
    )
    VALUES (
      ${scheduled_message_id},
      ${status},
      ${responsePayload ? JSON.stringify(responsePayload) : null},
      ${errorMessage ?? null}
    )
    RETURNING *
  `;
  return rows[0];
}
