import CompanionsList from "@/components/companion/CompanionList";
import { getUserCompanions, deleteCompanion } from "@/lib/actions/companion.actions";
import { getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const companions = await getUserCompanions();
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <CompanionsList
      title="Recently completed sessions"
      companions={companions}
      classNames="w-2/3 max-lg:w-full"
      user={user}
    />
  )
}

export default Page