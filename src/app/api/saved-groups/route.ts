import { NextResponse } from "next/server";

import { insertSavedGroup, listSavedGroups } from "@/db/savedGroups";
import { authorizeRoute } from "@/lib/authorizeRoute";

export const GET = authorizeRoute(async ({ user }) => {
  const groups = await listSavedGroups(user.id);
  return NextResponse.json(groups);
}, { logLabel: "[GET /api/saved-groups]" });

export const POST = authorizeRoute(async ({ request, user }) => {
  const body = await request.json();
  const { group_jid, group_name } = body as {
    group_jid: string;
    group_name?: string;
  };

  if (!group_jid) {
    return NextResponse.json({ error: "El identificador del grupo es obligatorio." }, { status: 400 });
  }

  const inserted = await insertSavedGroup(user.id, group_jid, group_name ?? group_jid);

  if (inserted === null) {
    return NextResponse.json({ error: "Este grupo ya estaba guardado." }, { status: 409 });
  }

  return NextResponse.json(inserted, { status: 201 });
}, { logLabel: "[POST /api/saved-groups]" });
