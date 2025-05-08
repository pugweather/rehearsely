"use client"
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'

type Props = {
  onChange: (value: string) => void,
  placeholder?: string
}

const SearchInput = ({onChange, placeholder}: Props) => {
  return (
    <div className='relative'>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute top-5.75 -translate-y-1/2 left-3 text-gray-300" />
        <input 
            type="text" 
            placeholder={placeholder || "Search..."}
            className="relative w-100 h-12 pl-8.5 border text-xl border-gray-300 bg-white rounded-3xl outline-none placeholder-gray-400"
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
  )
}

export default SearchInput