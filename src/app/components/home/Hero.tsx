import React from "react";
import ButtonLink from "../ui/ButtonLink";
import Link from "next/link";
import { createClient } from "../../../../utils/supabase/server";
// import { logout } from "../../logout/actions" // Uncomment if needed

export default async function Hero() {

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    return (
        <section className="flex flex-grow flex-col items-center justify-center h-full w-full text-center">

        <h1 className="text-4xl md:text-5xl font-bold">
            Your Digital Scene Partner—<span className="text-blue-950 text-6xl">Anytime, Anywhere.</span>.
        </h1>
        
        <p className="mt-4 text-2xl font-semibold">
            Less stress, more callbacks. Self-taping made easy.
        </p>
        
        <div className="mt-8 flex space-x-4">
            <Link href="/scenes-dashboard">
                <ButtonLink text="Go To Scenes Dashboard" />
            </Link>
            {!user && <Link href="#">
                <ButtonLink text="Log In" />
            </Link>}
        </div>
        
        {/* Testing logout (optional)
        <form action={logout}>
            <button type="submit">
            Logout
            </button>
        </form>
        */}
        </section>
    );
}
