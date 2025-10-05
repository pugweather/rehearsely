import React from "react";
import ButtonLink from "../ui/ButtonLink";
import SearchInput from "../ui/SearchInput";
import { faPlus, faTheaterMasks } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import localFont from 'next/font/local'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

type Props = {
    onChange: (value: string) => void
}

export default function ScenesDashboardHeader({onChange}: Props) {
    return (
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-6">
                {/* Blue theater masks icon */}
                <div className="w-12 h-12 rounded-full border-3 border-black bg-gradient-to-br from-[#72a4f2] to-[#5a8de8] flex items-center justify-center shadow-lg">
                    <FontAwesomeIcon icon={faTheaterMasks} className="text-lg text-white" />
                </div>
                
                <h1 className={`text-3xl font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
                    My Scenes
                </h1>
                
                {/* Search input - longer and right after title */}
                <div className="w-80">
                    <SearchInput onChange={onChange}/>
                </div>
            </div>
            
            {/* Create button */}
            <Link
                href={"/scene-name"}
                className="px-6 py-3 bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-xl border-3 border-black font-bold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden"
            >
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>

                <span className="flex items-center gap-2 relative z-10">
                    <FontAwesomeIcon icon={faPlus} className="text-base" />
                    Create Scene
                </span>
            </Link>
        </div>
    )
}