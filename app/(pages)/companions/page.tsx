import CompanionCard from "@/components/companion/CompanionCard";
import CompanionsList from "@/components/companion/CompanionList";
import CTA from "@/components/companion/CTA";
import {recentSessions} from "@/constants";
import {getUserCompanions } from "@/lib/actions/companion.actions";
import {getSubjectColor} from "@/lib/utils";

const Page = async () => {
    const companions = await getUserCompanions();
    // const recentSessionsCompanions = await getRecentSessions(10);

  return (
            <CompanionsList
                title="Recently completed sessions"
                companions={companions}
                classNames="w-2/3 max-lg:w-full"
            />
  )
}

export default Page