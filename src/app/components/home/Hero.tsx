import React from "react"
import ButtonLink from "../ui/Button"
import Link from "next/link"

export default function Hero() {
    return (
        <section className="flex flex-grow items-center justify-center h-full w-full">
            <Link href="/scenes-dashboard">
                <ButtonLink text="Get Started"/>
            </Link>
        </section>
    )
}