export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { listSavedGroups } from "@/db/savedGroups";
import { requireAppUser } from "@/lib/currentUser";
import SavedGroupsView from "./SavedGroupsView";

export default async function GroupsPage() {
  let user;
  try {
    user = await requireAppUser();
  } catch {
    redirect("/");
  }

  const initialGroups = await listSavedGroups(user.id);
  return <SavedGroupsView initialGroups={initialGroups} />;
}
