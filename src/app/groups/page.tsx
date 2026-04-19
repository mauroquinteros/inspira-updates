export const dynamic = "force-dynamic";

import { listSavedGroups } from "@/db/savedGroups";
import { authorizePage } from "@/lib/currentUser";
import SavedGroupsView from "./SavedGroupsView";

export default async function GroupsPage() {
  const user = await authorizePage();

  const initialGroups = await listSavedGroups(user.id);
  return <SavedGroupsView initialGroups={initialGroups} />;
}
