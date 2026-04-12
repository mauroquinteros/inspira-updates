import { listHistoryMessages } from "@/db/scheduledMessages";
import HistoryView from "@/components/history/HistoryView";

interface HistoryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const { status } = await searchParams;
  const messages = await listHistoryMessages(status);

  return <HistoryView initialMessages={messages} status={status} />;
}
