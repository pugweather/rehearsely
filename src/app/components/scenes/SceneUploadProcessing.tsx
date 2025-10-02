'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileText, faUsers, faSpinner } from '@fortawesome/free-solid-svg-icons'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

interface SceneUploadProcessingProps {
  sceneName: string
  fileName: string
}

const SceneUploadProcessing = ({ sceneName, fileName }: SceneUploadProcessingProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [currentWord, setCurrentWord] = useState('')
  const router = useRouter()

  const funWords = [
    'Thinking...',
    'Pondering...',
    'Analyzing...',
    'Contemplating...',
    'Deciphering...',
    'Unraveling...',
    'Interpreting...',
    'Processing...',
    'Examining...',
    'Investigating...',
    'Scrutinizing...',
    'Deliberating...'
  ]

  // Trigger slide-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Start processing simulation
      startProcessing()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const startProcessing = async () => {
    // Get the file from sessionStorage (in real implementation, this would be handled differently)
    const fileData = sessionStorage.getItem('uploadFile')
    if (!fileData) {
      console.error('No file data found')
      return
    }

    // Simulate processing with fun words
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 80))
      
      // Update progress
      setProgress(i)
      
      // Change word every 15% or so
      if (i % 15 === 0) {
        const randomWord = funWords[Math.floor(Math.random() * funWords.length)]
        setCurrentWord(randomWord)
      }
      
      // Instantly navigate when reaching 100%
      if (i === 100) {
        setIsComplete(true)
        router.push(`/scene-character-assignment?sceneName=${encodeURIComponent(sceneName)}&fileName=${encodeURIComponent(fileName)}`)
        return
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] relative -mt-[125px] pt-[125px]">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#72a4f2]/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-bl from-[#ffa05a]/6 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-tr from-[#FFD96E]/6 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Main content with slide animation */}
      <div className={`relative z-10 flex flex-col h-full transition-all duration-700 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">

          {/* Scene Title */}
          <div className="text-center mb-2">
            <div className={`text-2xl font-semibold text-gray-700 ${sunsetSerialMediumFont.className}`}>
              "{sceneName}"
            </div>
          </div>

          {/* File name */}
          <div className="text-center mb-8">
            <div className="text-lg text-gray-600 flex items-center gap-2 justify-center">
              <FontAwesomeIcon icon={faFileText} className="text-[#FFA05A]" />
              {fileName}
            </div>
          </div>

          {/* Main processing card */}
          <div className="bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl p-10 border-4 border-black shadow-xl max-w-2xl w-full">
            
            {/* Processing icon */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-black bg-white flex items-center justify-center">
                {isComplete ? (
                  <FontAwesomeIcon icon={faUsers} className="text-3xl text-[#72a4f2]" />
                ) : (
                  <FontAwesomeIcon icon={faSpinner} className="text-3xl text-[#FFA05A] animate-spin" />
                )}
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
                Processing Your Script
              </h1>
            </div>

            {/* Fun analyzing word */}
            <div className="mb-8 text-center">
              <div className={`text-2xl font-semibold text-[#FFA05A] ${sunsetSerialMediumFont.className}`}>
                {currentWord || 'Starting...'}
              </div>
            </div>

            {/* Simple progress bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-semibold text-gray-700">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
                <div 
                  className="bg-gradient-to-r from-[#72a4f2] to-[#FFA05A] h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Completion message */}
            {isComplete && (
              <div className="text-center text-sm text-gray-600">
                Redirecting to character assignment...
              </div>
            )}
          </div>

          {/* Decorative accent dots */}
          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-[#72a4f2] rounded-full opacity-70"></div>
            <div className="w-3 h-3 bg-[#ffa05a] rounded-full opacity-50"></div>
            <div className="w-3 h-3 bg-[#FFD96E] rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SceneUploadProcessing
