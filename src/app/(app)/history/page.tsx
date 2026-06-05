export const dynamic = "force-dynamic";

import { listHistoryMessages } from "@/db/scheduledMessages";
import { listSavedGroups } from "@/db/savedGroups";
import { authorizePage } from "@/lib/currentUser";
import HistoryView from "@/components/history/HistoryView";

interface HistoryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const user = await authorizePage();

  const { status } = await searchParams;
  const [messages, groups] = await Promise.all([
    listHistoryMessages(user.id, status),
    listSavedGroups(user.id),
  ]);

  const activeGroups = groups.filter((g) => g.is_active);

  return <HistoryView initialMessages={messages} activeGroups={activeGroups} status={status} />;
}
