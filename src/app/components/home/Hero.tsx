import React from "react"
import ButtonLink from "../ui/ButtonLink"
import Link from "next/link"
//import { logout } from "../../logout/actions"

export default function Hero() {
    return (
        <section className="flex flex-grow items-center justify-center h-full w-full">
            <Link href="/scenes-dashboard">
                <ButtonLink text="Get Started"/>
            </Link>

            {/* Testing logout
            <form action={logout}>
                <button type="submit">
                    Logout
                </button>
            </form> */}

        </section>
    )
}