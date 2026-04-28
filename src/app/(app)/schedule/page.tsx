export const dynamic = "force-dynamic";

import { listScheduledMessages } from "@/db/scheduledMessages";
import { listSavedGroups } from "@/db/savedGroups";
import { authorizePage } from "@/lib/currentUser";
import ScheduleView from "@/components/schedule/ScheduleView";

export default async function SchedulePage() {
  const user = await authorizePage();

  const [messages, allGroups] = await Promise.all([
    listScheduledMessages(user.id),
    listSavedGroups(user.id),
  ]);

  const activeGroups = allGroups.filter((group) => group.is_active);

  return <ScheduleView activeGroups={activeGroups} initialMessages={messages} />;
}
