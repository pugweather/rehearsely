"use client"
import React, {use, useEffect, useState} from "react";
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

const nunito = localFont({
    src: "../../../../public/fonts/Nunito-Variable.ttf",
})

const bogue = localFont({
    src: "../../../../public/fonts/bogue-black.ttf",
})

export default function Hero() {

    const user = useUserStore((s) => s.user)
    const router = useRouter()
    const pathname = usePathname()
    const [isLoaded, setIsLoaded] = useState(false)
    const [showElements, setShowElements] = useState({
        title: false,
        subtitle: false,
        button: false,
        image: false
    })

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

    // Animation sequence
    useEffect(() => {
        // Wait for everything to load first
        const timer = setTimeout(() => {
            setIsLoaded(true)
            
            // Staggered animation sequence
            setTimeout(() => setShowElements(prev => ({...prev, title: true})), 100)
            setTimeout(() => setShowElements(prev => ({...prev, subtitle: true})), 300)
            setTimeout(() => setShowElements(prev => ({...prev, button: true})), 500)
            setTimeout(() => setShowElements(prev => ({...prev, image: true})), 700)
        }, 200)
        
        return () => clearTimeout(timer)
    }, [])

    return (
        <section className="flex flex-grow flex-col items-center justify-center h-full w-full text-center">

            <h1 className={`text-7xl font-bold transition-all duration-700 ease-out ${bogue.className} ${
                showElements.title 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
            }`}>
                Your Digital Scene Partner.
                <br></br>
                <span className="text-black">Anytime, Anywhere.</span>
            </h1>
            
            <p className={`mt-12 text-3xl font-semibold transition-all duration-700 ease-out ${user ? "mb-10" : "mb-5"} ${nunito.className} ${
                showElements.subtitle 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
            }`}>
                Less stress, more callbacks. Self-taping made easy.
            </p>

            {
                user &&
                <Link href="/scenes">
                    <div className={`group relative inline-block transition-all duration-700 ease-out ${
                        showElements.button 
                            ? 'opacity-100 translate-y-0 scale-100' 
                            : 'opacity-0 translate-y-8 scale-95'
                    }`}>
                        {/* blue offset layer BEHIND the button */}
                        <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2
                                    rounded-lg border-4 border-black bg-[#72a4f2]
                                    transition-transform duration-200 ease-out
                                    group-hover:translate-x-3 group-hover:translate-y-3"
                        />

                        {/* the button on TOP */}
                        <button
                        className="relative z-10 inline-flex items-center justify-center
                                    px-6 py-3 font-bold text-xl rounded-lg
                                    border-4 border-black bg-[#e9dfd2] text-black
                                    transition-transform duration-200 ease-out
                                    hover:-translate-y-0.5 active:translate-y-0"
                        >
                        Go To Scenes
                        </button>
                    </div>
                </Link>
            }

            <div className={`relative min-w-[600px] min-h-[300px] transition-all duration-700 ease-out ${
                showElements.image 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-12 scale-95'
            }`}>
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
