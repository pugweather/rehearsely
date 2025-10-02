"use client"
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faScroll, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useSceneDelay } from '@/app/context/countdownContext'
import { useTeleprompter } from '@/app/context/teleprompterContext'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

const SceneSettings = () => {
  const { countdown, setCountdown } = useSceneDelay()
  const { isTeleprompterActive, setIsTeleprompterActive } = useTeleprompter()
  const [showDelayOptions, setShowDelayOptions] = useState(false)

  const delayOptions = [
    { value: 3, label: '3 seconds' },
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' }
  ]

  return (
    <div className="space-y-6">
      
      {/* Instructions Header */}
      <div className="text-center pb-2">
        <h2 className={`text-xl font-bold text-gray-800 mb-2 ${sunsetSerialMediumFont.className}`}>
          Scene Settings
        </h2>
        <p className="text-sm text-gray-600">
          Click the options below to customize
        </p>
      </div>
      
      {/* Delay Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#72a4f2] border-2 border-black flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} className="text-white text-sm" />
          </div>
          <h3 className={`text-lg font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
            Countdown Delay
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {delayOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setCountdown(option.value)}
              className={`px-4 py-3 rounded-xl border-2 border-black font-semibold transition-all duration-200 ${
                countdown === option.value
                  ? 'bg-[#72a4f2] text-white shadow-xl'
                  : 'bg-white text-gray-800 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              } ${sunsetSerialMediumFont.className}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-300"></div>

      {/* Teleprompter Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#ffa05a] border-2 border-black flex items-center justify-center">
            <FontAwesomeIcon icon={faScroll} className="text-white text-sm" />
          </div>
          <h3 className={`text-lg font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
            Teleprompter Mode
          </h3>
        </div>
        
        <button
          onClick={() => setIsTeleprompterActive(!isTeleprompterActive)}
          className={`w-full px-6 py-4 rounded-xl border-2 border-black font-semibold transition-all duration-200 ${
            isTeleprompterActive
              ? 'bg-[#ffa05a] text-white shadow-xl'
              : 'bg-white text-gray-800 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
          } ${sunsetSerialMediumFont.className}`}
        >
          {isTeleprompterActive ? 'Teleprompter ON' : 'Teleprompter OFF'}
        </button>
      </div>
    </div>
  )
}

export default SceneSettings