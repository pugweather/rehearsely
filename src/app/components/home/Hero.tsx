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
    const [isButtonLoading, setIsButtonLoading] = useState(false)
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

    // Handle button click with loading animation
    const handleGoToScenes = () => {
        setIsButtonLoading(true)
        // Navigate after a short delay to show loading state
        setTimeout(() => {
            router.push('/scenes')
        }, 300)
    }

    return (
        <section className="flex flex-grow flex-col items-center justify-center h-screen w-full text-center">

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
                <div className={`transition-all duration-700 ease-out ${
                    showElements.button 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-8 scale-95'
                }`}>
                    <button
                    onClick={handleGoToScenes}
                    disabled={isButtonLoading}
                    className={`group relative inline-flex items-center justify-center
                                px-8 py-4 font-bold text-xl rounded-2xl
                                border-4 border-black 
                                bg-gradient-to-br from-[#72a4f2] to-[#5b8ce8] text-white
                                transition-all duration-300 ease-out min-w-[220px]
                                shadow-xl hover:shadow-2xl ${sunsetSerialMediumFont.className} ${
                                    isButtonLoading 
                                        ? 'cursor-not-allowed opacity-80 scale-95' 
                                        : 'hover:-translate-y-2 hover:scale-105 active:translate-y-0 active:scale-100'
                                }`}
                    >
                    {/* Subtle inner glow effect */}
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none opacity-60"></div>
                    
                    {/* Button content */}
                    <div className="relative z-10">
                        {isButtonLoading ? (
                            <div className="flex items-center gap-3">
                                {/* Elegant pulsing dots */}
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                                </div>
                                <span>Loading</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span>Go To Scenes</span>
                                {/* Arrow icon that slides on hover */}
                                <div className="transition-transform duration-300 group-hover:translate-x-1">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                    </button>
                </div>
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
