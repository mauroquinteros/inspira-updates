import { headers as nextHeaders } from "next/headers";
import { findUserByAuthUserId, upsertUser, type AppUser } from "@/db/users";
import { auth } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  email: string;
  name?: string | null;
};

export async function getCurrentUser(request?: Request): Promise<CurrentUser | null> {
  const headers = request ? request.headers : await nextHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
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
  const existing = await findUserByAuthUserId(currentUser.id);

  if (existing) {
    return existing;
  }

  return upsertUser(currentUser.id, currentUser.email, currentUser.name);
}
