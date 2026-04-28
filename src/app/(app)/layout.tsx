import AppShell from "@/components/layout/AppShell";
import { authorizePage } from "@/lib/currentUser";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await authorizePage();

  return <AppShell userEmail={user.email}>{children}</AppShell>;
}
