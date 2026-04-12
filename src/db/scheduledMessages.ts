import { db } from "@/db/client";

export interface ScheduledMessage {
  id: string;
  group_id: string;
  content: string;
  scheduled_for: Date;
  status: "scheduled" | "sent" | "failed" | "cancelled";
  sent_at: Date | null;
  created_at: Date;
}

export interface ScheduledMessageWithGroup extends ScheduledMessage {
  group_name: string;
  group_jid: string;
}

export async function insertScheduledMessage(
  group_id: string,
  content: string,
  scheduled_for: Date
): Promise<ScheduledMessage> {
  const rows = await db<ScheduledMessage[]>`
    INSERT INTO scheduled_messages (group_id, content, scheduled_for, status)
    VALUES (${group_id}, ${content}, ${scheduled_for}, 'scheduled')
    RETURNING *
  `;
  return rows[0];
}

export async function listScheduledMessages(): Promise<ScheduledMessageWithGroup[]> {
  return db<ScheduledMessageWithGroup[]>`
    SELECT
      sm.*,
      sg.group_name,
      sg.group_jid
    FROM scheduled_messages sm
    JOIN saved_groups sg ON sg.id = sm.group_id
    ORDER BY sm.scheduled_for DESC
  `;
}

export async function getDueMessages(): Promise<ScheduledMessageWithGroup[]> {
  return db<ScheduledMessageWithGroup[]>`
    SELECT
      sm.*,
      sg.group_name,
      sg.group_jid
    FROM scheduled_messages sm
    JOIN saved_groups sg ON sg.id = sm.group_id
    WHERE sm.status = 'scheduled'
      AND sm.scheduled_for <= NOW()
  `;
}

export async function updateMessageStatus(
  id: string,
  status: "sent" | "failed" | "cancelled",
  sentAt?: Date
): Promise<ScheduledMessage | null> {
  const rows = await db<ScheduledMessage[]>`
    UPDATE scheduled_messages
    SET
      status = ${status},
      sent_at = ${sentAt ?? null}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function cancelMessage(
  id: string
): Promise<ScheduledMessage | null> {
  const rows = await db<ScheduledMessage[]>`
    UPDATE scheduled_messages
    SET status = 'cancelled'
    WHERE id = ${id}
      AND status = 'scheduled'
    RETURNING *
  `;
  return rows[0] ?? null;
}

export type HistoryMessage = {
  id: string;
  group_name: string;
  message_preview: string;
  scheduled_for: Date;
  sent_at: Date | null;
  status: string;
  error_message: string | null;
  response_payload: unknown | null;
};

export async function listHistoryMessages(
  status?: string
): Promise<HistoryMessage[]> {
  return db<HistoryMessage[]>`
    SELECT
      sm.id,
      sg.group_name,
      LEFT(sm.content, 80) AS message_preview,
      sm.scheduled_for,
      sm.sent_at,
      sm.status,
      me.error_message,
      me.response_payload
    FROM scheduled_messages sm
    JOIN saved_groups sg ON sg.id = sm.group_id
    LEFT JOIN message_executions me
      ON me.id = (
        SELECT id FROM message_executions
        WHERE scheduled_message_id = sm.id
        ORDER BY executed_at DESC
        LIMIT 1
      )
    ${status ? db`WHERE sm.status = ${status}` : db``}
    ORDER BY sm.scheduled_for DESC
  `;
}
