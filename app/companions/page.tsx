import CompanionsList from "@/components/companion/CompanionList";
import {getUserCompanions } from "@/lib/actions/companion.actions";
import { getUser } from "@/utils/supabase/server";


const Page = async () => {
    const companions = await getUserCompanions();
    const user = await getUser()
    // const recentSessionsCompanions = await getRecentSessions(10);

  return (
        <CompanionsList
          title="Recently completed sessions"
          companions={companions}
          classNames="w-2/3 max-lg:w-full" 
          user={user}            />
  )
}

export default Page