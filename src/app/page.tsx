import Link from "next/link";
import { redirect } from "next/navigation";
import AuthControls from "@/components/auth/AuthControls";
import { getCurrentUser } from "@/lib/currentUser";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/session");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-950 px-6 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-100 shadow-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-emerald-400">
          Inspira Updates
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight">
          Sign in to manage your own WhatsApp scheduling workspace.
        </h1>
        <p className="mb-8 max-w-xl text-sm leading-7 text-slate-400">
          Each Google account gets its own Evolution instance, groups, scheduled
          messages, and history. Start by signing in, then connect WhatsApp and
          schedule your first update.
        </p>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <AuthControls isAuthenticated={false} />
          <Link
            href="https://developers.google.com/identity/protocols/oauth2"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
          >
            OAuth setup reference
          </Link>
        </div>

        <div className="grid gap-4 text-sm text-slate-400 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="mb-2 font-medium text-slate-200">1. Sign in</p>
            <p>Authenticate with Google and create your personal workspace.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="mb-2 font-medium text-slate-200">2. Connect</p>
            <p>Link your own WhatsApp session through a dedicated instance.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="mb-2 font-medium text-slate-200">3. Schedule</p>
            <p>Manage your groups, queue messages, and review execution history.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
