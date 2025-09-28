import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons'
import MicErrorModal from '../ui/MicErrorModal'

type Props = {
    sceneIsPlaying: boolean,
    setSceneIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

const PlaySceneButtonsWrapper = ({sceneIsPlaying, setSceneIsPlaying}:  Props) => {
  const [showMicErrorModal, setShowMicErrorModal] = useState(false)

  const handlePlayClick = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      console.log('Microphone access granted, starting scene...');
      // Stop the stream immediately since we just needed permission
      stream.getTracks().forEach(track => track.stop())
      setSceneIsPlaying(true)
    } catch (error) {
      console.error('Failed to access microphone:', error);
      setShowMicErrorModal(true)
    }
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-60">
        <div className="relative bg-[#f4efe8] shadow-[0_0_3px_1px_rgba(0,0,0,0.06)] rounded-2xl px-6 py-4 flex items-center justify-center border border-black/10">

            {
              sceneIsPlaying ?
              <button className="flex justify-center items-center w-12 h-12 rounded-full bg-black transition-opacity ease-in-out duration-200 hover:opacity-85" onClick={() => setSceneIsPlaying(false)}>
                <FontAwesomeIcon icon={faStop} className="text-white text-2xl ml-0.5" />
              </button>
              :
              <button className="flex justify-center items-center w-12 h-12 rounded-full bg-black transition-opacity ease-in-out duration-200 hover:opacity-85" onClick={handlePlayClick}>
                <FontAwesomeIcon icon={faPlay} className="text-white text-2xl ml-0.5" />
              </button>
            }
          </div>
      </div>

      <MicErrorModal
        isOpen={showMicErrorModal}
        onClose={() => setShowMicErrorModal(false)}
      />
    </>
  )
}

export default PlaySceneButtonsWrapper
