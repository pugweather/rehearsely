import React, { useEffect, useRef } from 'react';
import Overlay from './Overlay';

type DropdownItem = {
    label: string,
    onClick:() => void,
    className?: string
}

type DropdownProps = {
    dropdownData: DropdownItem[],
    closeDropdown: () => void
}

const Dropdown = ({dropdownData, closeDropdown}: DropdownProps) => {

    return (
        <>
            <Overlay zIndex='z-25' closeDropdown={closeDropdown}/>
            <ul 
                className={`px-2 py-2 absolute rounded-sm font-medium text-sm bg-white text-black cursor-pointer shadow-[0_0_3px_1px_rgba(0,0,0,0.1)] min-w-37`}>
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