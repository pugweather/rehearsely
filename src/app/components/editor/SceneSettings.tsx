"use client"
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faScroll, faMapMarkerAlt, faChevronDown, faX } from '@fortawesome/free-solid-svg-icons'
import { useSceneDelay } from '@/app/context/countdownContext'
import { useTeleprompter } from '@/app/context/teleprompterContext'
import { usePracticeRange } from '@/app/context/practiceRangeContext'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

type Props = {
  onRangeSelectionToggle?: () => void
  onClose?: () => void
}

const SceneSettings = ({ onRangeSelectionToggle, onClose }: Props) => {
  const { countdown, setCountdown } = useSceneDelay()
  const { isTeleprompterActive, setIsTeleprompterActive } = useTeleprompter()
  const { isRangeSelectionMode, setIsRangeSelectionMode, isRangeSet, clearRange, setClickedLineId } = usePracticeRange()
  const [showDelayOptions, setShowDelayOptions] = useState(false)

  const delayOptions = [
    { value: 3, label: '3 seconds' },
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' }
  ]

  return (
    <div className="space-y-6 relative">

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center hover:bg-gray-50 transition-all duration-200 z-10"
        >
          <FontAwesomeIcon icon={faX} className="text-sm" />
        </button>
      )}

      {/* Instructions Header */}
      <div className="text-center pb-4">
        <h2 className={`text-xl font-bold text-gray-800 mb-2 ${sunsetSerialMediumFont.className}`}>
          Scene Settings
        </h2>
        <p className="text-sm text-gray-600">
          Customize how your scene will play
        </p>
      </div>
      
      {/* Horizontal Settings Row */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Countdown Delay */}
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#72a4f2] border-2 border-black flex items-center justify-center">
              <FontAwesomeIcon icon={faClock} className="text-white text-sm" />
            </div>
            <h3 className={`text-sm font-bold text-gray-800 text-center whitespace-nowrap ${sunsetSerialMediumFont.className}`}>
              Countdown Delay
            </h3>
            <p className="text-xs text-gray-500 text-center whitespace-nowrap">
              Time before scene starts
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowDelayOptions(!showDelayOptions)}
              className={`w-full px-3 py-2 rounded-lg border-2 border-black font-semibold text-sm transition-all duration-200 bg-white text-gray-800 hover:bg-gray-50 ${sunsetSerialMediumFont.className}`}
            >
              {countdown}s <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
            </button>
            
            {showDelayOptions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-xl z-50">
                {delayOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setCountdown(option.value)
                      setShowDelayOptions(false)
                    }}
                    className={`w-full px-3 py-2 text-sm font-semibold transition-all duration-200 first:rounded-t-md last:rounded-b-md ${
                      countdown === option.value
                        ? 'bg-[#72a4f2] text-white'
                        : 'text-gray-800 hover:bg-gray-50'
                    } ${sunsetSerialMediumFont.className}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Teleprompter */}
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#ffa05a] border-2 border-black flex items-center justify-center">
              <FontAwesomeIcon icon={faScroll} className="text-white text-sm" />
            </div>
            <h3 className={`text-sm font-bold text-gray-800 text-center whitespace-nowrap ${sunsetSerialMediumFont.className}`}>
              Teleprompter
            </h3>
            <p className="text-xs text-gray-500 text-center whitespace-nowrap">
              Show teleprompter
            </p>
          </div>
          
          <button
            onClick={() => setIsTeleprompterActive(!isTeleprompterActive)}
            className={`w-full px-3 py-2 rounded-lg border-2 border-black font-semibold text-sm transition-all duration-200 ${
              isTeleprompterActive
                ? 'bg-[#ffa05a] text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50'
            } ${sunsetSerialMediumFont.className}`}
          >
            {isTeleprompterActive ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Scene Range */}
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#22c55e] border-2 border-black flex items-center justify-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-white text-sm" />
            </div>
            <h3 className={`text-sm font-bold text-gray-800 text-center whitespace-nowrap ${sunsetSerialMediumFont.className}`}>
              Set Scene Range
            </h3>
            <p className="text-xs text-gray-500 text-center whitespace-nowrap">
              Focus on specific lines
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsRangeSelectionMode(!isRangeSelectionMode)
              setClickedLineId(null)
              // Close the dropdown when toggling ON or OFF
              if (onRangeSelectionToggle) {
                onRangeSelectionToggle()
              }
            }}
            className={`w-full px-3 py-2 rounded-lg border-2 border-black font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
              isRangeSelectionMode
                ? 'bg-[#22c55e] text-white'
                : 'bg-white text-gray-800 hover:bg-gray-50'
            } ${sunsetSerialMediumFont.className}`}
          >
            {isRangeSelectionMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default SceneSettings