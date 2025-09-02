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
        <div className="flex items-baseline pt-5 px-5 h-25">
            <div className={`text-black font-semibold text-4xl mr-5 ${sunsetSerialMediumFont.className}`}>My Scenes</div>
            <SearchInput onChange={onChange}/>
            <Link href={"/scene-name"} className="ml-auto btn btn-lg default-btn black grow-on-hover">
                <FontAwesomeIcon icon={faPlus} />
                <span>Create Scene</span>
            </Link>
        </div>
    )
}