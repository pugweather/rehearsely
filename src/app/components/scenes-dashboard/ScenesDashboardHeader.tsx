import React from "react";
import ButtonLink from "../ui/Button";
import SearchInput from "../ui/SearchInput";
import { faPlus} from "@fortawesome/free-solid-svg-icons";

export default function ScenesDashboardHeader() {
    return (
        <div className="flex items-center p-5 border-b border-b-gray-200">
            <div className="text-blue-950 font-bold text-xl mr-5">My Scenes</div>
            <SearchInput />
            <button className="ml-auto"><ButtonLink text="Create Scene" icon={faPlus}/></button>
        </div>
    )
}