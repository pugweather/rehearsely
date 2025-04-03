import React, { useEffect, useRef } from 'react';
import Overlay from './Overlay';

type DropdownItem = {
    label: string,
    onClick: () => void,
    className?: string
}

type DropdownProps = {
    dropdownData: DropdownItem[],
    dropdownPos: {top: number, right: number} | null,
    closeDropdown: () => void
}

const Dropdown = ({dropdownData, dropdownPos, closeDropdown}: DropdownProps) => {

    if (!dropdownPos) return null

    return (
        <>
            <ul 
                style={{
                    top: dropdownPos.top,
                    right: dropdownPos.right,
                    position: "absolute"
                }}
                className={`px-2 py-2 top- rounded-sm font-medium text-sm bg-white text-black cursor-pointer shadow-[0_0_3px_1px_rgba(0,0,0,0.1)] min-w-37 z-20`}>
                {dropdownData.map(item => {
                    return (
                        <li 
                            key={item.label} 
                            onClick={item.onClick} 
                            className={`px-1 py-1.5 border-b border-b-gray-100 ${item.className}`}>{item.label}
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

export default Dropdown