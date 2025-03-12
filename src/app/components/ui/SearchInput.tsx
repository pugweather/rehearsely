"use client"
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons'

const SearchInput = () => {
  return (
    <div className='relative'>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute top-4.75 -translate-y-1/2 left-2.25 text-gray-300" />
        <input 
            type="text" 
            placeholder="Search scenes"
            className="relative w-75 h-10 pl-7.5 border border-gray-300 rounded-3xl outline-none placeholder-gray-400"
            onChange={() => console.log("changed")}
        />
    </div>
  )
}

export default SearchInput