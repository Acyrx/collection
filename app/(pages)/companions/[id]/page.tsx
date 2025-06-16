import { getCompanion } from "@/lib/actions/companion.actions";
import { redirect } from "next/navigation";
import CompanionComponent from "@/components/companion/CompanionComponent";
import { getUser } from "@/utils/supabase/server";

interface CompanionSessionPageProps {
  params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = await params;
  const companion = await getCompanion(id);
  const user = await getUser();
  if (!user) redirect("/login");
  // if (!title) redirect("/companions");

  return (
          <CompanionComponent
            {...companion}
            companionId={id}
            userName={user.full_name!}
            userImage={user.imageUrl!}
          />
  );
};

export default CompanionSession;