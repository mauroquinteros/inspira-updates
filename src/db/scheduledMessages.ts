import { db } from "@/db/client";

export interface ScheduledMessage {
  id: string;
  user_id: string;
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

export interface DueScheduledMessage extends ScheduledMessageWithGroup {
  instance_name: string;
}

export async function insertScheduledMessage(
  user_id_or_group_id: string,
  group_id_or_content: string,
  content_or_scheduled_for: string | Date,
  maybe_scheduled_for?: Date
): Promise<ScheduledMessage> {
  const user_id = maybe_scheduled_for ? user_id_or_group_id : null;
  const group_id = maybe_scheduled_for ? group_id_or_content : user_id_or_group_id;
  const content =
    typeof content_or_scheduled_for === "string" ? content_or_scheduled_for : group_id_or_content;
  const scheduled_for =
    maybe_scheduled_for ?? (content_or_scheduled_for as Date);

  const rows = await db<ScheduledMessage[]>`
    INSERT INTO scheduled_messages (user_id, group_id, content, scheduled_for, status)
    VALUES (${user_id}, ${group_id}, ${content}, ${scheduled_for}, 'scheduled')
    RETURNING *
  `;
  return rows[0];
}

export async function listScheduledMessages(
  user_id?: string
): Promise<ScheduledMessageWithGroup[]> {
  if (user_id) {
    return db<ScheduledMessageWithGroup[]>`
      SELECT
        sm.*,
        sg.group_name,
        sg.group_jid
      FROM scheduled_messages sm
      JOIN saved_groups sg ON sg.id = sm.group_id
      WHERE sm.user_id = ${user_id}
      ORDER BY sm.scheduled_for DESC
    `;
  }

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

export async function getDueMessagesWithOwnerInstance(): Promise<DueScheduledMessage[]> {
  return db<DueScheduledMessage[]>`
    SELECT
      sm.*,
      sg.group_name,
      sg.group_jid,
      ei.instance_name
    FROM scheduled_messages sm
    JOIN saved_groups sg ON sg.id = sm.group_id
    JOIN evolution_instances ei ON ei.user_id = sm.user_id
    WHERE sm.status = 'scheduled'
      AND sm.scheduled_for <= NOW()
  `;
}

export async function getDueMessages(): Promise<DueScheduledMessage[]> {
  return getDueMessagesWithOwnerInstance();
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
  user_id_or_id: string,
  maybe_id?: string
): Promise<ScheduledMessage | null> {
  const user_id = maybe_id ? user_id_or_id : null;
  const id = maybe_id ?? user_id_or_id;

  const rows = user_id
    ? await db<ScheduledMessage[]>`
        UPDATE scheduled_messages
        SET status = 'cancelled'
        WHERE id = ${id}
          AND user_id = ${user_id}
          AND status = 'scheduled'
        RETURNING *
      `
    : await db<ScheduledMessage[]>`
        UPDATE scheduled_messages
        SET status = 'cancelled'
        WHERE id = ${id}
          AND status = 'scheduled'
        RETURNING *
      `;
  return rows[0] ?? null;
}

export async function updateScheduledMessage(
  user_id: string,
  id: string,
  fields: { group_id: string; content: string; scheduled_for: Date }
): Promise<ScheduledMessage | null> {
  const rows = await db<ScheduledMessage[]>`
    UPDATE scheduled_messages
    SET
      group_id = ${fields.group_id},
      content = ${fields.content},
      scheduled_for = ${fields.scheduled_for},
      updated_at = NOW()
    WHERE id = ${id}
      AND user_id = ${user_id}
      AND status = 'scheduled'
    RETURNING *
  `;
  return rows[0] ?? null;
}

export type HistoryMessage = {
  id: string;
  group_id: string;
  group_name: string;
  content: string;
  scheduled_for: Date;
  sent_at: Date | null;
  status: string;
  error_message: string | null;
  response_payload: unknown | null;
};

export async function listHistoryMessages(
  user_id: string,
  status?: string
): Promise<HistoryMessage[]> {
  return await db<HistoryMessage[]>`
    SELECT
      sm.id,
      sm.group_id,
      sg.group_name,
      sm.content,
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
    WHERE sm.user_id = ${user_id}
    ${status ? db`AND sm.status = ${status}` : db``}
    ORDER BY sm.scheduled_for DESC
  `;
}
