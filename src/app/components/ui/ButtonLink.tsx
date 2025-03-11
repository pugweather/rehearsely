import Image from "next/image"
import React from "react"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ButtonProps {
    text: string;
    icon?: IconDefinition;
}

export default function ButtonLink({text, icon}: ButtonProps) {

    return (
        <span className="flex justify-between items-center px-4 py-2 bg-blue-950 text-white rounded-md font-medium">
            {icon && <FontAwesomeIcon icon={icon} className="mr-2.25"/>}
            <span>{text}</span>
        </span>
    )
}