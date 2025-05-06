import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {

    return (
        <nav className="w-full h-20 px-5 flex justify-between items-center bg-[#fffef5] border-gray-300">
            <Link href={"/"} className="font-bold text-xl cursor-pointer relative" style={{ width: "250px", height: "75px" }}>
            <Image
                src="/logo-2.png"
                alt="Rehearsely logo"
                fill
                style={{objectFit: "contain"}}
            />
            </Link>
            <div className="w-10 h-10 rounded-full flex justify-center items-center bg-blue-500 text-white text-lg cursor-pointer">M</div>
        </nav>
    )
}