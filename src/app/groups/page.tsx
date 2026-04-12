import { listSavedGroups } from "@/db/savedGroups";
import SavedGroupsView from "./SavedGroupsView";

export default async function GroupsPage() {
  const initialGroups = await listSavedGroups();
  return <SavedGroupsView initialGroups={initialGroups} />;
}
