"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm font-medium text-[#fe924b] transition-colors hover:text-[#ffc69f] disabled:opacity-50"
    >
      {loading ? "Saliendo…" : "Salir"}
    </button>
  );
}
