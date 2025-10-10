import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop, faArrowLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { usePracticeRange } from '@/app/context/practiceRangeContext'
import MicErrorModal from '../ui/MicErrorModal'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

type Props = {
    sceneIsPlaying: boolean,
    setSceneIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

const PlaySceneButtonsWrapper = ({sceneIsPlaying, setSceneIsPlaying}:  Props) => {
  const [showMicErrorModal, setShowMicErrorModal] = useState(false)
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)
  const [micErrorType, setMicErrorType] = useState<'permission' | 'no_device'>('permission')
  const [isPlayLoading, setIsPlayLoading] = useState(false)
  const [isStopLoading, setIsStopLoading] = useState(false)
  const [isDoneLoading, setIsDoneLoading] = useState(false)
  const [isClearLoading, setIsClearLoading] = useState(false)
  
  const { isRangeSelectionMode, setIsRangeSelectionMode, isRangeSet, hasSelection, clearRange, setStartLineId, setEndLineId, setClickedLineId, saveRange } = usePracticeRange()

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
    setIsPlayLoading(true)
    
    // If permission not yet granted, request it
    if (!micPermissionGranted) {
      // First check if microphones are available
      const hasMicrophone = await checkMicrophoneAvailability()
      if (!hasMicrophone) {
        setMicErrorType('no_device')
        setShowMicErrorModal(true)
        setIsPlayLoading(false)
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
        // Auto-start scene after permission is granted
        setTimeout(() => {
          setSceneIsPlaying(true)
          setIsPlayLoading(false)
        }, 300)
      } catch (error) {
        console.error('Failed to access microphone:', error);
        // Check the specific error to determine if it's a permission issue or no device
        if (error instanceof Error && (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError')) {
          setMicErrorType('no_device')
        } else {
          setMicErrorType('permission')
        }
        setShowMicErrorModal(true)
        setIsPlayLoading(false)
      }
    } else {
      // Permission already granted, start the scene
      setTimeout(() => {
        setSceneIsPlaying(true)
        setIsPlayLoading(false)
      }, 300)
    }
  }

  const handleStopClick = () => {
    setIsStopLoading(true)
    setTimeout(() => {
      setSceneIsPlaying(false)
      setIsStopLoading(false)
    }, 300)
  }

  const handleDoneClick = () => {
    setIsDoneLoading(true)
    setTimeout(() => {
      saveRange()
      setIsRangeSelectionMode(false)
      setClickedLineId(null)
      setIsDoneLoading(false)
    }, 300)
  }

  const handleClearClick = () => {
    setIsClearLoading(true)
    setTimeout(() => {
      setStartLineId(null)
      setEndLineId(null)
      setClickedLineId(null)
      setIsClearLoading(false)
    }, 300)
  }

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70]">
        <div className="bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl p-4 border-4 border-black shadow-xl flex items-center justify-center gap-3">
            {
              isRangeSelectionMode ?
              <>
                <button
                  className={`flex justify-center items-center gap-3 px-6 py-3 rounded-full bg-[#ffa05a] border-2 border-black transition-all duration-200 group ${
                    (isDoneLoading || isClearLoading) ? 'cursor-not-allowed opacity-80 scale-95' : 'hover:shadow-xl hover:-translate-y-1'
                  }`}
                  onClick={handleDoneClick}
                  disabled={isDoneLoading || isClearLoading}
                >
                  {isDoneLoading ? (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                    </div>
                  ) : (
                    <FontAwesomeIcon icon={faArrowLeft} className="text-white text-lg group-hover:scale-110 transition-transform duration-200" />
                  )}
                  <span className={`text-white font-semibold ${sunsetSerialMediumFont.className}`}>
                    {isDoneLoading ? 'Saving...' : 'Done'}
                  </span>
                </button>
                <button
                  className={`flex justify-center items-center gap-3 px-6 py-3 rounded-full border-2 border-black transition-all duration-200 group ${
                    (isClearLoading || !hasSelection()) ? 'cursor-not-allowed opacity-60 scale-95 bg-blue-300' : 'bg-[#72a4f2] hover:shadow-xl hover:-translate-y-1'
                  }`}
                  onClick={handleClearClick}
                  disabled={isClearLoading || !hasSelection()}
                >
                  {isClearLoading ? (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                    </div>
                  ) : (
                    <FontAwesomeIcon icon={faXmark} className="text-white text-lg group-hover:scale-110 transition-transform duration-200" />
                  )}
                  <span className={`text-white font-semibold ${sunsetSerialMediumFont.className}`}>
                    {isClearLoading ? 'Clearing...' : 'Clear Selection'}
                  </span>
                </button>
              </>
              :
              sceneIsPlaying ?
              <button 
                className={`flex justify-center items-center w-16 h-16 rounded-full bg-black border-2 border-black transition-all duration-200 group ${
                  isStopLoading ? 'cursor-not-allowed opacity-80 scale-95' : 'hover:shadow-xl hover:-translate-y-1'
                }`}
                onClick={handleStopClick}
                disabled={isStopLoading}
              >
                {isStopLoading ? (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                  </div>
                ) : (
                  <FontAwesomeIcon icon={faStop} className="text-white text-2xl group-hover:scale-110 transition-transform duration-200" />
                )}
              </button>
              :
              <button 
                className={`flex justify-center items-center w-16 h-16 rounded-full bg-black border-2 border-black transition-all duration-200 group ${
                  isPlayLoading ? 'cursor-not-allowed opacity-80 scale-95' : 'hover:shadow-xl hover:-translate-y-1'
                }`}
                onClick={handlePlayClick}
                disabled={isPlayLoading}
              >
                {isPlayLoading ? (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                  </div>
                ) : (
                  <FontAwesomeIcon icon={faPlay} className="text-white text-2xl ml-0.5 group-hover:scale-110 transition-transform duration-200" />
                )}
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
