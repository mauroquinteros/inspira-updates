export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { listHistoryMessages } from "@/db/scheduledMessages";
import { requireAppUser } from "@/lib/currentUser";
import HistoryView from "@/components/history/HistoryView";

interface HistoryPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  let user;
  try {
    user = await requireAppUser();
  } catch {
    redirect("/");
  }

  const { status } = await searchParams;
  const messages = await listHistoryMessages(user.id, status);

  return <HistoryView initialMessages={messages} status={status} />;
}
