'use server'
import CompanionForm from "@/components/companion/CompanionForm";
import {redirect} from "next/navigation";
import {newCompanionPermissions} from "@/lib/actions/companion.actions";
import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/utils/supabase/server";

const NewCompanion = async () => {
    const user = await getUser();
    console.log(user)
    if(!user.id) redirect('/login');

    const canCreateCompanion = await newCompanionPermissions();

    return (
        <main className="min-lg:w-1/3 min-md:w-2/3 items-center justify-center ml-[400px]">
         {canCreateCompanion ? (
                <article className="w-full gap-4 flex flex-col">
                    <h1>Companion Builder</h1>

                    <CompanionForm />
                </article>
                ) : (
                    <article className="companion-limit">
                        <Image src="/images/limit.svg" alt="Companion limit reached" width={360} height={230} />
                        <div className="cta-badge">
                            Upgrade your plan
                        </div>
                        <h1>You’ve Reached Your Limit</h1>
                        <p>You’ve reached your companion limit. Upgrade to create more companions and premium features.</p>
                        <Link href="/subscription" className="btn-primary w-full justify-center" >
                            Upgrade My Plan
                        </Link>
                    </article>
                )}
        </main>
    )
}

export default NewCompanion