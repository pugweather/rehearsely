import React, { useEffect, useRef } from 'react'

type DropdownItem = {
    label: string,
    onClick:() => void,
    className?: string
}

type DropdownProps = {
    className: string,
    dropdownData: DropdownItem[],
    isOpen: boolean
}

const Dropdown = ({className, dropdownData, isOpen}: DropdownProps) => {

    const dropdownRef = useRef<HTMLUListElement>(null)

    // Close dropdown if one was opened
      useEffect(() => {
  
        const handleClickOutsideDropwdown = (e: MouseEvent) => {
            const clickedOutside = dropdownRef.current && dropdownRef.current.contains(e.target as Node)
            // If we click outside of the dropdown while it's open, close it and ignore ALL other events
            if (clickedOutside) {
                if (isOpen) {
                    e.stopPropagation()
                    
                }
            }
        }
  
      }, [])

    if (!isOpen) return null

    return (
        <ul className={`px-2 py-2 absolute right-0 top-7.5 rounded-sm font-medium text-sm bg-white text-black shadow-[0_0_3px_1px_rgba(0,0,0,0.1)] z-50 min-w-37 ${className}`} ref={dropdownRef}>
            {dropdownData.map(item => {
                return (
                    <li key={item.label} onClick={item.onClick} className={`px-1 py-1.5 border-b border-b-gray-100 ${item.className}`}>{item.label}</li>
                )
            })}
        </ul>
    )
}

export default Dropdown