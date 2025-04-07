import Image from "next/image"
import React from "react"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

interface ButtonProps {
    text: string;
    textColor?: string;
    bgColor?: string;
    icon?: IconDefinition;
}

export default function ButtonLink({text, textColor, bgColor, icon}: ButtonProps) {

    const isHexColor = (value: string) => /^#([A-Fa-f0-9]{3}){1,2}$/.test(value);

    const buttonStyles = {
        color: isHexColor(textColor ?? '') ? textColor : undefined,
        backgroundColor: isHexColor(bgColor ?? '') ? bgColor : undefined
    }

    return (
        <span 
            className={"flex justify-between items-center px-4 py-2 bg-blue-950 text-white rounded-md font-medium"} 
            style={buttonStyles}>
            {icon && <FontAwesomeIcon icon={icon} className="mr-2.25"/>}
            <span>{text}</span>
        </span>
    )
}