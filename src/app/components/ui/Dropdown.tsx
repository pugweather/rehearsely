import React, { useEffect, useRef } from 'react';
import Overlay from './Overlay';
import { DropdownProps } from '@/app/types';

// Pass in z-index to 'className' prop (tailwind format)!!!!!!!!
const Dropdown = ({dropdownData, dropdownPos, className, closeDropdown}: DropdownProps) => {

    if (!dropdownPos) return null

    return (
        <>
            <ul 
                style={{
                    top: dropdownPos.top,
                    right: dropdownPos.right,
                    position: "absolute"
                }}
                className={`top-0 rounded-sm font-medium text-sm bg-white text-black cursor-pointer shadow-[0_0_3px_1px_rgba(0,0,0,0.1)] min-w-37" ${className}`}>
                {dropdownData?.map(item => {
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