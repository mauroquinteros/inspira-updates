import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { upsertUser, type AppUser } from "@/db/users";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name?: string | null;
};

function getDisplayName(user: User): string | null {
  const metadata = user.user_metadata;

  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const fullName =
    ("full_name" in metadata && typeof metadata.full_name === "string" && metadata.full_name) ||
    ("name" in metadata && typeof metadata.name === "string" && metadata.name) ||
    null;

  return fullName;
}

export async function getCurrentUser(request?: Request): Promise<CurrentUser | null> {
  void request;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: getDisplayName(user),
  };
}

export async function requireAuth(request?: Request): Promise<CurrentUser> {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAppUser(request?: Request): Promise<AppUser> {
  const currentUser = await requireAuth(request);
  return upsertUser(currentUser.id, currentUser.email, currentUser.name);
}

export async function authorizePage(): Promise<AppUser> {
  try {
    return await requireAppUser();
  } catch {
    redirect("/");
  }
}
