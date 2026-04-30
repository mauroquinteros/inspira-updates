import Link from "next/link";
import { MessagesSquare } from "lucide-react";

import AppHeaderNav from "@/components/layout/AppHeaderNav";
import SignOutButton from "@/components/SignOutButton";

interface AppShellProps {
  userEmail?: string;
  children: React.ReactNode;
}

export default function AppShell({ userEmail, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#040535]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link href="/inicio" className="inline-flex shrink-0 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-[#2ae5dc] via-[#0f3994] to-[#4740ff] shadow-[0_8px_24px_rgba(42,229,220,0.22)]">
              <MessagesSquare className="size-4.5 text-white" />
            </div>
            <span className="font-heading text-base font-semibold text-white">Inspira Updates</span>
          </Link>

          <AppHeaderNav />

          <div className="flex shrink-0 items-center gap-4">
            {userEmail ? (
              <span className="hidden text-sm text-slate-400 lg:block">{userEmail}</span>
            ) : null}
            <SignOutButton />
          </div>
        </div>
      </header>

      <main id="contenido-principal" className="mx-auto w-full max-w-7xl flex-1 px-5 py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
