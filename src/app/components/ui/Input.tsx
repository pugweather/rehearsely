"use client"
import React from 'react'

type Props = {
  onChange: (value: string) => void,
  value: string,
  placeholder?: string
}

const Input = ({onChange, value, placeholder}: Props) => {
  return (
    <div className='relative'>
        <input 
            type="text" 
            placeholder={placeholder || "Search..."}
            value={value || ''}
            className="relative w-[100%] h-12 pl-5 text-xl text-black border border-gray-300 rounded-3xl outline-none placeholder-gray-400"
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
  )
}

export default Input