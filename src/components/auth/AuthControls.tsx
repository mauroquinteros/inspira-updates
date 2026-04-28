"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type Props = {
  isAuthenticated: boolean;
  userEmail?: string;
  compact?: boolean;
};

export default function AuthControls({ isAuthenticated, userEmail, compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"signin" | "signout" | null>(null);

  async function handleSignIn() {
    setLoading("signin");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/inicio",
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
        size={compact ? "sm" : "lg"}
        className="gap-2"
      >
        <Sparkles className="size-4" />
        {loading === "signin" ? "Ingresando..." : "Entrar con Google"}
      </Button>
    );
  }

  if (compact) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleSignOut}
        disabled={loading === "signout"}
        size="sm"
      >
        <LogOut className="size-4" />
        {loading === "signout" ? "Saliendo..." : "Salir"}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {userEmail ? (
        <span className="text-xs text-slate-400">{userEmail}</span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        onClick={handleSignOut}
        disabled={loading === "signout"}
        className="justify-center"
      >
        <LogOut className="size-4" />
        {loading === "signout" ? "Cerrando sesión..." : "Cerrar sesión"}
      </Button>
    </div>
  );
}
