import React from "react";
import ButtonLink from "../ui/ButtonLink";
import SearchInput from "../ui/SearchInput";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
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
        <div className="flex items-baseline pt-8 px-8 pb-6 border-b border-black/5">
            <div className={`text-black font-semibold text-4xl mr-8 ${sunsetSerialMediumFont.className}`}>My Scenes</div>
            
            <div className="flex-1 max-w-md mx-8">
                <SearchInput onChange={onChange}/>
            </div>
            
            <Link 
                href={"/scene-name"} 
                className="ml-auto btn btn-lg default-btn black grow-on-hover relative overflow-hidden group"
            >
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                
                <FontAwesomeIcon 
                    icon={faPlus} 
                    className="relative z-10" 
                />
                <span className="relative z-10">Create Scene</span>
            </Link>
        </div>
    )
}