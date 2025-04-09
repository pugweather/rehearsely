import React from "react";
import Link from "next/link";

export default function Navbar() {

    const handleHomeClick = () => {
        
    }

    return (
        <nav className="w-full h-20 px-5 flex justify-between items-center bg-white border-b border-gray-300">
            <Link href={"/"} className="font-bold text-xl cursor-pointer">Rehearsely</Link>
            <div className="w-10 h-10 rounded-full flex justify-center items-center bg-blue-500 text-white text-lg">M</div>
        </nav>
    )
}