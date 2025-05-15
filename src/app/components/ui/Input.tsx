"use client"
import React from 'react'
import clsx from 'clsx'

type Props = {
  onChange: (value: string) => void,
  value: string,
  placeholder?: string,
  className?: string
}

const Input = ({onChange, value, placeholder, className}: Props) => {
  return (
    <div className='relative'>
        <input 
            type="text" 
            placeholder={placeholder || "Search..."}
            value={value || ''}
            className={clsx(
              "relative w-[100%] text-black border border-gray-300 outline-none placeholder-gray-400 bg-white",
              className ? className : "h-12 pl-5 text-xl rounded-3xl"
            )}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
  )
}

export default Input