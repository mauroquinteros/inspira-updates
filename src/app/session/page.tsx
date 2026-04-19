import { redirect } from "next/navigation";
import SessionScreen from "@/components/SessionScreen";
import { requireAppUser } from "@/lib/currentUser";

export default async function SessionPage() {
  try {
    await requireAppUser();
  } catch {
    redirect("/");
  }

  return <SessionScreen />;
}
