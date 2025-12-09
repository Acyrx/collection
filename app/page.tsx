import CompanionsList from "@/components/companion/companions-list";
import {
  getUserCompanions,
  getRecentSessions,
} from "@/lib/actions/companion.actions";
import { getUser } from "@/utils/supabase/server";

export default async function Page() {
  const [companions, recentSessions, user] = await Promise.all([
    getUserCompanions(),
    getRecentSessions(),
    getUser(),
  ]);

  return (
    <CompanionsList
      title="My Companions"
      companions={companions}
      recentSessions={recentSessions}
      classNames="w-full"
      user={user}
    />
  );
}
