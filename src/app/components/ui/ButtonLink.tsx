import React from "react";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import localFont from "next/font/local";

const certaSansMedium = localFont({
    src: "../../../../public/fonts/certaSansMedium.otf",
})

interface ButtonProps {
  text: string;
  icon?: IconDefinition;
  textColor?: string;
  bgColor?: string;
  className?: string;
}

export default function ButtonLink({text, icon, textColor, bgColor, className}: ButtonProps) {
    
  const isHexColor = (value: string) => /^#([A-Fa-f0-9]{3}){1,2}$/.test(value);

  const customStyles: React.CSSProperties = {
    ...(isHexColor(textColor || "") && { color: textColor }),
    ...(isHexColor(bgColor || "") && { backgroundColor: bgColor }),
  };

  return (
    <span
      className={clsx(
        // Sensible defaults
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 ease-in-out",
        "bg-[#f47c2c] text-white hover:opacity-85 hover:shadow-sm tracking-wider",
        certaSansMedium.className,
        className // Allows full override: width, padding, font-size, etc.
      )}
      style={customStyles}
    >
      {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
      <span>{text}</span>
    </span>
  );
}

