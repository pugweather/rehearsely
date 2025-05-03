import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

const PlaySceneButtonsWrapper = () => {
  return (
    <div className='fixed bottom-1 rounded-xl bg-gray-200 w-100 h-20 flex items-center justify-center'>
        <button className='flex justify-center items-center w-13 h-13 rounded-full bg-black transition-opacity ease-in-out duration-200 hover:opacity-85'>
            <FontAwesomeIcon icon={faPlay} className='text-white text-2xl ml-0.5'/>
        </button>
    </div>
  )
}

export default PlaySceneButtonsWrapper