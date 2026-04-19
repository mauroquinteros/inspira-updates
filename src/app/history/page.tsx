export const dynamic = "force-dynamic";

import { listHistoryMessages } from "@/db/scheduledMessages";
import { authorizePage } from "@/lib/currentUser";
import HistoryView from "@/components/history/HistoryView";

interface HistoryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const user = await authorizePage();

  const { status } = await searchParams;
  const messages = await listHistoryMessages(user.id, status);

  return <HistoryView initialMessages={messages} status={status} />;
}
