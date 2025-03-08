import React from "react";

export default function Navbar() {
    return (
        <nav className="w-full h-20 px-5 flex justify-between items-center bg-white">
            <div className="font-bold text-xl">Rehearsely</div>
            <div className="w-10 h-10 rounded-full flex justify-center items-center bg-blue-500 text-white">M</div>
        </nav>
    )
}