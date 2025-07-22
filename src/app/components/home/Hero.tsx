"use client"
import React, {use, useEffect} from "react";
import ButtonLink from "../ui/ButtonLink";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js'
import Image from "next/image";
import localFont from "next/font/local";
import { useUserStore } from "@/app/stores/useUserStores";
import { useRouter, usePathname } from "next/navigation";

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

export default function Hero() {

    const user = useUserStore((s) => s.user)
    const router = useRouter()
    const pathname = usePathname()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        // Clean up the OAuth hash from the URL
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname)
        }
    }, [])

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = useUserStore.getState().user
        if (session && !user) {
            useUserStore.getState().setUser(session.user)
            console.log("setting user....")
            if (pathname === '/signin') {
                router.push('/')
            }
        }
        })
        return () => authListener.subscription.unsubscribe()
    }, [pathname])

    return (
        <section className="flex flex-grow flex-col items-center justify-center h-full w-full text-center">

            <h1 className={`text-7xl font-bold ${sunsetSerialMediumFont.className}`}>
                Your Digital Scene Partner—
                <br></br>
                <span className="text-black">Anytime, Anywhere.</span>
            </h1>
            
            <p className={`mt-12 text-2xl font-semibold ${user ? "mb-10" : "mb-5"} ${sunsetSerialMediumFont.className}`}>
                Less stress, more callbacks. Self-taping made easy.
            </p>

            {
                user &&
                <div className="flex space-x-4 text-xl px-12 mb-7.5">
                    
                    <Link href="/scenes">
                        <ButtonLink text="Go To Scenes Dashboard" className={"px-7 py-3 text-2xl"}/>
                    </Link>  
                </div>
            }

            <div className='relative min-w-[600px] min-h-[300px]'>
                <Image
                    src="/hero-image.png"
                    alt="add line"
                    fill
                    style={{objectFit: "contain"}}
                />
            </div>
    
        </section>

    );
}
