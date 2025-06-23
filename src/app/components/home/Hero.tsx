"use client"
import React from "react";
import ButtonLink from "../ui/ButtonLink";
import Link from "next/link";
import { createClient } from "../../../../utils/supabase/server";
import Image from "next/image";
import localFont from "next/font/local";
import { useUserStore } from "@/app/stores/useUserStores";

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

export default function Hero() {

    const user = useUserStore((s) => s.user)

    return (
        <section className="flex flex-grow flex-col items-center justify-center h-full w-full text-center">

            <h1 className={`text-7xl font-bold ${sunsetSerialMediumFont.className}`}>
                Your Digital Scene Partner—
                <br></br>
                <span className="text-black">Anytime, Anywhere.</span>
            </h1>
            
            <p className="mt-12 mb-12 text-2xl font-semibold">
                Less stress, more callbacks. Self-taping made easy.
            </p>

            <div className="flex space-x-4 text-xl px-12 mb-7.5">
                <Link href="/scenes-dashboard">
                    <ButtonLink text="Go To Scenes Dashboard" className={"px-7 py-3 text-2xl"}/>
                </Link>
                {!user && 
                <Link href="/signin">
                    <ButtonLink text="Log In" className={"px-7 py-3 text-2xl"}/>
                </Link>}
            </div>

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
