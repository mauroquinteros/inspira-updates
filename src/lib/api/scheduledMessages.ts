export type UpdateScheduledMessagePayload = {
  group_id: string;
  content: string;
  scheduled_for: string;
};

/**
 * Sends a scheduled-message edit to the API. Resolves on success and throws
 * an Error with the server message on failure, so callers only handle a
 * single error path.
 */
export async function updateScheduledMessage(
  id: string,
  payload: UpdateScheduledMessagePayload
): Promise<void> {
  const res = await fetch(`/api/scheduled-messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "No pudimos guardar los cambios.");
  }
}
