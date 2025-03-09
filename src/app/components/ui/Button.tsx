import Image from "next/image"
import React from "react"

interface ButtonProps {
    text: string,
    iconSrc?: string
}

export default function ButtonLink({text, iconSrc}: ButtonProps) {

    return (
        <span className="flex justify-between items-center px-4 py-2 bg-blue-950 text-white rounded-md font-medium">
            {iconSrc && <Image src={iconSrc} alt=""/>}
            <span>{text}</span>
        </span>
    )
}