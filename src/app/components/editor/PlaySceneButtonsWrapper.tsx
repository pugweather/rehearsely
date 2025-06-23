import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons'

type Props = {
    sceneIsPlaying: boolean,
    setSceneIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

const PlaySceneButtonsWrapper = ({sceneIsPlaying, setSceneIsPlaying}:  Props) => {

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-60">
      <div className="bg-[#fffef5] shadow-[0_0_3px_1px_rgba(0,0,0,0.06)] rounded-xl px-6 py-4 flex items-center justify-center border border-black/10">
        {
          sceneIsPlaying ? 
          <button className="flex justify-center items-center w-13 h-13 rounded-full bg-black transition-opacity ease-in-out duration-200 hover:opacity-85" onClick={() => setSceneIsPlaying(false)}>
            <FontAwesomeIcon icon={faStop} className="text-white text-2xl ml-0.5" />
          </button>
          :
          <button className="flex justify-center items-center w-13 h-13 rounded-full bg-black transition-opacity ease-in-out duration-200 hover:opacity-85" onClick={() => setSceneIsPlaying(true)}>
            <FontAwesomeIcon icon={faPlay} className="text-white text-2xl ml-0.5" />
          </button>
        }
      </div>
    </div>
  )
}

export default PlaySceneButtonsWrapper
