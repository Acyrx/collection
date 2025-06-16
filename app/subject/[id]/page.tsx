import CompanionComponent from '@/components/subject/specific-subject';
import React from 'react';
import { getCompanion } from "@/lib/actions/companion.actions";
import { redirect } from "next/navigation";
import { getUser } from "@/utils/supabase/server";

type Props = {
  params: {
    id: string;
  };
};

const Page = async ({ params }: Props) => {
  const { id } = params;

  const companion = await getCompanion(id);
  const user = await getUser();

  if (!user) redirect("/login");

  return (
    <CompanionComponent
      {...companion}
      companionId={id}
      userName={user.full_name!}
      userImage={user.imageUrl!}
    />
  );
};

export default Page;
