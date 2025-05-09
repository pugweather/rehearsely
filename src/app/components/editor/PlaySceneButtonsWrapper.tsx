import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

const PlaySceneButtonsWrapper = () => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-60">
      <div className="bg-[#fffef5] shadow-[0_0_3px_1px_rgba(0,0,0,0.06)] rounded-xl px-6 py-4 flex items-center justify-center border border-black/10">
        <button className="flex justify-center items-center w-13 h-13 rounded-full bg-black transition-opacity ease-in-out duration-200 hover:opacity-85">
          <FontAwesomeIcon icon={faPlay} className="text-white text-2xl ml-0.5" />
        </button>
      </div>
    </div>
  )
}

export default PlaySceneButtonsWrapper
