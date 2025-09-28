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
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)
  const [micErrorType, setMicErrorType] = useState<'permission' | 'no_device'>('permission')

  // Check if microphones are available
  const checkMicrophoneAvailability = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
      return audioInputs.length > 0
    } catch (error) {
      console.error('Error checking microphone availability:', error)
      return false
    }
  }

  const handlePlayClick = async () => {
    // If permission not yet granted, request it
    if (!micPermissionGranted) {
      // First check if microphones are available
      const hasMicrophone = await checkMicrophoneAvailability()
      if (!hasMicrophone) {
        setMicErrorType('no_device')
        setShowMicErrorModal(true)
        return
      }

      try {
        console.log('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        });
        console.log('Microphone access granted');
        // Stop the stream immediately since we just needed permission
        stream.getTracks().forEach(track => track.stop())
        setMicPermissionGranted(true)
        // Don't auto-start scene - user must click play again
      } catch (error) {
        console.error('Failed to access microphone:', error);
        // Check the specific error to determine if it's a permission issue or no device
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setMicErrorType('no_device')
        } else {
          setMicErrorType('permission')
        }
        setShowMicErrorModal(true)
      }
    } else {
      // Permission already granted, start the scene
      setSceneIsPlaying(true)
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
        errorType={micErrorType}
        onClose={async () => {
          setShowMicErrorModal(false)
          // Only request permission when modal is closed if it's a permission issue, not a device issue
          if (!micPermissionGranted && micErrorType === 'permission') {
            try {
              console.log('Requesting microphone access after modal close...');
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  sampleRate: 44100,
                },
              });
              console.log('Microphone access granted');
              // Stop the stream immediately since we just needed permission
              stream.getTracks().forEach(track => track.stop())
              setMicPermissionGranted(true)
            } catch (error) {
              console.error('Failed to access microphone after modal close:', error);
              // Don't show modal again to avoid infinite loop
            }
          }
        }}
      />
    </>
  )
}

export default PlaySceneButtonsWrapper
