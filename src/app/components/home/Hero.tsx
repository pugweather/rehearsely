"use client"
import React, {use, useEffect, useState, useRef} from "react";
import ButtonLink from "../ui/ButtonLink";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js'
import Image from "next/image";
import localFont from "next/font/local";
import { useUserStore } from "@/app/stores/useUserStores";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

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
    const [isVisible, setIsVisible] = useState(false)
    const [isButtonLoading, setIsButtonLoading] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)

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

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Creative animation variants
    const titleVariants = {
        hidden: { 
            opacity: 0, 
            y: 50, 
            scale: 0.8,
            rotateX: -15
        },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            rotateX: 0,
            transition: {
                type: "spring" as const,
                damping: 20,
                stiffness: 300,
                delay: 0.1
            }
        }
    };

    const subtitleVariants = {
        hidden: { 
            opacity: 0, 
            x: -100, 
            rotate: -5
        },
        visible: { 
            opacity: 1, 
            x: 0, 
            rotate: 0,
            transition: {
                type: "spring" as const,
                damping: 25,
                stiffness: 400,
                delay: 0.3
            }
        }
    };

    const buttonVariants = {
        hidden: { 
            opacity: 0, 
            scale: 0.3, 
            y: 100,
            rotate: 180
        },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            rotate: 0,
            transition: {
                type: "spring" as const,
                damping: 15,
                stiffness: 200,
                delay: 0.5
            }
        }
    };

    const imageVariants = {
        hidden: { 
            opacity: 0, 
            scale: 0.5, 
            y: 150,
            rotateY: 45
        },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            rotateY: 0,
            transition: {
                type: "spring" as const,
                damping: 20,
                stiffness: 150,
                delay: 0.7
            }
        }
    };

    // Handle button click with loading animation
    const handleGoToScenes = () => {
        setIsButtonLoading(true)
        // Navigate after a short delay to show loading state
        setTimeout(() => {
            router.push('/scenes')
        }, 300)
    }

    return (
        <section ref={sectionRef} className="flex flex-col items-center justify-center h-full w-full text-center mt-[125px] py-12 px-4">

            <motion.h1 
                className={`text-7xl font-bold ${bogue.className}`}
                variants={titleVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
            >
                Your Digital Scene Partner.
                <br></br>
                <span className="text-black">Anytime, Anywhere.</span>
            </motion.h1>
            
            <motion.p 
                className={`mt-12 text-3xl font-semibold ${user ? "mb-10" : "mb-5"} ${nunito.className}`}
                variants={subtitleVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
            >
                Less stress, more callbacks. Self-taping made easy.
            </motion.p>

            {
                user &&
                <motion.div
                    variants={buttonVariants}
                    initial="hidden"
                    animate={isVisible ? "visible" : "hidden"}
                >
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
                </motion.div>
            }

            <motion.div 
                className="relative min-w-[600px] min-h-[300px]"
                variants={imageVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
            >
                <Image
                    src="/hero-image.png"
                    alt="add line"
                    fill
                    style={{objectFit: "contain"}}
                />
            </motion.div>
    
        </section>

    );
}
