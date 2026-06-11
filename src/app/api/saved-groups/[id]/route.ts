import { NextResponse } from "next/server";

import { archiveSavedGroup, countPendingMessages, toggleSavedGroup } from "@/db/savedGroups";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const GET = authorizeRoute<{ id: string }>(async ({ user, params }) => {
  const { id } = await params;
  const pendingCount = await countPendingMessages(user.id, id);
  return NextResponse.json({ pendingCount });
}, { logLabel: "[GET /api/saved-groups/[id]]" });

export const PATCH = authorizeRoute<{ id: string }>(async ({ request, user, params }) => {
  const { id } = await params;
  const body = await request.json();
  const { is_active } = body as { is_active: boolean };

  const updated = await toggleSavedGroup(user.id, id, is_active);
  if (updated === null) {
    return NextResponse.json({ error: "No encontramos el grupo solicitado." }, { status: 404 });
  }

  return NextResponse.json(updated);
}, { logLabel: "[PATCH /api/saved-groups/[id]]" });

export const DELETE = authorizeRoute<{ id: string }>(async ({ user, params }) => {
  const { id } = await params;
  const archived = await archiveSavedGroup(user.id, id);
  if (!archived) {
    return NextResponse.json({ error: "No encontramos el grupo solicitado." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}, { logLabel: "[DELETE /api/saved-groups/[id]]" });
