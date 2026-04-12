import { listScheduledMessages } from "@/db/scheduledMessages";
import { listSavedGroups } from "@/db/savedGroups";
import ScheduleView from "@/components/schedule/ScheduleView";

export default async function SchedulePage() {
  const [messages, allGroups] = await Promise.all([
    listScheduledMessages(),
    listSavedGroups(),
  ]);

  const activeGroups = allGroups.filter((g) => g.is_active);

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <h1 className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-1">
          Schedule
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Schedule WhatsApp messages to your saved groups.
        </p>
      </div>
      <ScheduleView activeGroups={activeGroups} initialMessages={messages} />
    </main>
  );
}
