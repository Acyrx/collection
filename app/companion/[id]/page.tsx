import { getCompanion } from "@/lib/actions/companion.actions";
import { getUser } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CompanionComponent from "@/components/companion/companion-component";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanionSessionPage({ params }: PageProps) {
  const { id } = await params;
  const [companion, user] = await Promise.all([getCompanion(id), getUser()]);

  if (!companion) {
    redirect("/");
  }

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <CompanionComponent
      companion={companion}
      userName={
        user.user_metadata?.full_name || user.email?.split("@")[0] || "Student"
      }
      userImage={user.user_metadata?.avatar_url}
    />
  );
}
