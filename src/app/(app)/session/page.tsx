import SessionScreen from "@/components/SessionScreen";
import { authorizePage } from "@/lib/currentUser";

export default async function SessionPage() {
  await authorizePage();

  return <SessionScreen />;
}
