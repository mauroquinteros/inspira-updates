"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Props = {
  isAuthenticated: boolean;
  userEmail?: string;
};

export default function AuthControls({ isAuthenticated, userEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"signin" | "signout" | null>(null);

  async function handleSignIn() {
    setLoading("signin");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/session",
    });
  }

  async function handleSignOut() {
    setLoading("signout");
    await authClient.signOut();
    router.push("/");
    router.refresh();
    setLoading(null);
  }

  if (!isAuthenticated) {
    return (
      <Button
        type="button"
        onClick={handleSignIn}
        disabled={loading === "signin"}
        className="bg-emerald-600 text-white hover:bg-emerald-500"
      >
        {loading === "signin" ? "Connecting..." : "Sign in with Google"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {userEmail ? (
        <span className="hidden text-xs text-slate-500 sm:inline">{userEmail}</span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        onClick={handleSignOut}
        disabled={loading === "signout"}
        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
      >
        {loading === "signout" ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
