import React from 'react'

type Props = {
  zIndex: string;
  bgColor?: string | null;
  closeDropdown: () => void;
}

const Overlay = ({zIndex, bgColor, closeDropdown}: Props) => {

  return (
    <div 
      className={`fixed inset-0 cursor-auto ${zIndex} ${bgColor || ''}`} 
      onClick={(e) => {
        e.stopPropagation()
        closeDropdown()
    }}>
    </div>
  )
}

export default Overlay