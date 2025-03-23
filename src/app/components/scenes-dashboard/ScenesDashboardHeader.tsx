import React from "react";
import ButtonLink from "../ui/ButtonLink";
import SearchInput from "../ui/SearchInput";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

type Props = {
    onChange: (value: string) => void
}

export default function ScenesDashboardHeader({onChange}: Props) {
    return (
        <div className="flex items-center p-5 border-b border-b-gray-200">
            <div className="text-blue-950 font-bold text-xl mr-5">My Scenes</div>
            <SearchInput onChange={onChange}/>
            <Link href={"/scene-name"} className="ml-auto"><ButtonLink text="Create Scene" icon={faPlus}/></Link>
        </div>
    )
}