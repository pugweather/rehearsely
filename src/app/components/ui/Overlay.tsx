import React from 'react'

type Props = {
  bgColor?: string | null;
  closeDropdown: () => void;
}

const Overlay = ({bgColor, closeDropdown}: Props) => {

  return (
    <div 
      className={`fixed inset-0 cursor-auto z-10 ${bgColor || ''}`} 
      onClick={(e) => {
        e.stopPropagation()
        closeDropdown()
    }}>
    </div>
  )
}

export default Overlay