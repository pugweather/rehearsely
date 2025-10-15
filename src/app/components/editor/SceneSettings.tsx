"use client"
import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faScroll, faMapMarkerAlt, faChevronDown, faX, faForward } from '@fortawesome/free-solid-svg-icons'
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
  
  // Silence timeout state
  const [silenceTimeout, setSilenceTimeout] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rehearsely_silence_timeout')
      return saved ? parseInt(saved, 10) : 0
    }
    return 0
  })
  
  const [showDelayOptions, setShowDelayOptions] = useState(false)
  const [showSilenceOptions, setShowSilenceOptions] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const silenceDropdownRef = useRef<HTMLDivElement>(null)

  // Persist silence timeout to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rehearsely_silence_timeout', silenceTimeout.toString())
    }
  }, [silenceTimeout])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDelayOptions(false)
      }
      if (silenceDropdownRef.current && !silenceDropdownRef.current.contains(event.target as Node)) {
        setShowSilenceOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const delayOptions = [
    { value: 3, label: '3 seconds' },
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' }
  ]

  const silenceOptions = [
    { value: 0, label: 'Disabled' },
    { value: 3, label: '3 second' },
    { value: 6, label: '6 seconds' },
    { value: 9, label: '9 seconds' },
    { value: 12, label: '12 seconds' },
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
      
      {/* Settings Grid - 2x2 Layout */}
      <div className="grid grid-cols-2 gap-8">
        
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
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDelayOptions(!showDelayOptions)}
              className={`w-full px-3 py-2 rounded-lg border-2 border-black font-semibold text-sm transition-all duration-200 bg-white text-gray-800 hover:bg-gray-50 ${sunsetSerialMediumFont.className}`}
            >
              {countdown}s <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
            </button>
            
            {showDelayOptions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 fade-in duration-300 ease-out">
                {delayOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setCountdown(option.value)
                      setShowDelayOptions(false)
                    }}
                    className={`w-full px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
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
            <p className="text-xs text-gray-500 text-center">
              Focus on<br />specific lines
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

        {/* Auto-Advance on Silence */}
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#8b5cf6] border-2 border-black flex items-center justify-center">
              <FontAwesomeIcon icon={faForward} className="text-white text-sm" />
            </div>
            <h3 className={`text-sm font-bold text-gray-800 text-center whitespace-nowrap ${sunsetSerialMediumFont.className}`}>
              Auto-Advance
            </h3>
            <p className="text-xs text-gray-500 text-center">
              Skip after silence<br />while speaking
            </p>
          </div>
          
          <div className="relative" ref={silenceDropdownRef}>
            <button
              onClick={() => setShowSilenceOptions(!showSilenceOptions)}
              className={`w-full px-3 py-2 rounded-lg border-2 border-black font-semibold text-sm transition-all duration-200 ${
                silenceTimeout > 0 
                  ? 'bg-[#8b5cf6] text-white' 
                  : 'bg-white text-gray-800 hover:bg-gray-50'
              } ${sunsetSerialMediumFont.className}`}
            >
              {silenceTimeout === 0 ? 'OFF' : `${silenceTimeout}s`} <FontAwesomeIcon icon={faChevronDown} className="ml-1 text-xs" />
            </button>
            
            {showSilenceOptions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2 fade-in duration-300 ease-out">
                {silenceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSilenceTimeout(option.value)
                      setShowSilenceOptions(false)
                    }}
                    className={`w-full px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                      silenceTimeout === option.value
                        ? 'bg-[#8b5cf6] text-white'
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

      </div>

    </div>
  )
}

export default SceneSettings