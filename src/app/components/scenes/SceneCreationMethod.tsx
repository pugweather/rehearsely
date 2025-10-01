'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

interface SceneCreationMethodProps {
  sceneId: string
  sceneName: string
}

type CreationMethod = 'upload' | 'write' | null

const SceneCreationMethod = ({ sceneId, sceneName }: SceneCreationMethodProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<CreationMethod>(null)
  const router = useRouter()

  // Trigger slide-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleCreateScene = () => {
    if (selectedMethod === 'upload') {
      // TODO: Navigate to upload flow
      console.log('Upload selected')
    } else if (selectedMethod === 'write') {
      // Navigate to editor to write manually
      router.push(`/editor/${sceneId}`)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] relative overflow-hidden">
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
        
        {/* Header */}
        <div className="flex items-center justify-between p-8">
          <Link
            href="/scenes"
            className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors duration-200 group"
          >
            <div className="w-12 h-12 rounded-full bg-white/70 border-2 border-black flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-200">
              <FontAwesomeIcon icon={faArrowLeftLong} className="text-lg" />
            </div>
            <span className={`text-lg ${sunsetSerialMediumFont.className}`}>Back</span>
          </Link>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">

          {/* Scene Title */}
          <div className="text-center mb-2">
            <div className={`text-2xl font-semibold text-gray-700 ${sunsetSerialMediumFont.className}`}>
              "{sceneName}"
            </div>
          </div>

          {/* Main instruction */}
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
              How would you like to create your scene?
            </h1>
          </div>

          {/* Options */}
          <div className="flex flex-col lg:flex-row gap-8 max-w-5xl w-full mb-8">
            
            {/* Upload Option */}
            <div className="flex-1">
              <button
                onClick={() => setSelectedMethod('upload')}
                className="w-full group relative"
              >
                <div className={`bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl p-10 border-4 transition-all duration-300 ${
                  selectedMethod === 'upload'
                    ? 'border-[#FFA05A] shadow-2xl'
                    : 'border-black shadow-lg hover:shadow-xl'
                }`}>

                  <div className="relative z-10 text-center">
                    {/* Fun Ko-fi/Skribbl style icon */}
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-black bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                      <div className="relative">
                        {/* PDF/Document stack icon */}
                        <div className="absolute -top-2 -left-2 w-14 h-16 bg-[#FFA05A] border-3 border-black rounded transform rotate-[-8deg] shadow-md"></div>
                        <div className="absolute -top-1 left-0 w-14 h-16 bg-[#FFD96E] border-3 border-black rounded transform rotate-[-4deg] shadow-md"></div>
                        <div className="relative w-14 h-16 bg-white border-3 border-black rounded flex flex-col p-2 gap-1 shadow-lg">
                          <div className="w-full h-1.5 bg-black rounded"></div>
                          <div className="w-3/4 h-1.5 bg-black rounded"></div>
                          <div className="w-full h-1.5 bg-black rounded"></div>
                          <div className="w-2/3 h-1.5 bg-black rounded"></div>
                        </div>
                      </div>
                    </div>

                    <div className="relative inline-block mb-3">
                      <h2 className={`text-2xl font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
                        Upload PDF
                      </h2>
                    </div>

                    <p className="text-gray-600 text-base leading-relaxed">
                      Have a script ready? Upload it and we'll format it for practice!
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* OR Divider */}
            <div className="flex items-center justify-center lg:flex-col">
              <div className="hidden lg:block w-px h-24 bg-gray-300"></div>
              <div className="lg:hidden h-px w-24 bg-gray-300"></div>

              <div className="mx-4 lg:my-4 px-4 py-2 bg-white rounded-full border-2 border-black shadow-md">
                <span className={`text-lg font-semibold text-gray-700 ${sunsetSerialMediumFont.className}`}>
                  or
                </span>
              </div>

              <div className="hidden lg:block w-px h-24 bg-gray-300"></div>
              <div className="lg:hidden h-px w-24 bg-gray-300"></div>
            </div>

            {/* Write Option */}
            <div className="flex-1">
              <button
                onClick={() => setSelectedMethod('write')}
                className="w-full group relative"
              >
                <div className={`bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl p-10 border-4 transition-all duration-300 ${
                  selectedMethod === 'write'
                    ? 'border-[#72a4f2] shadow-2xl'
                    : 'border-black shadow-lg hover:shadow-xl'
                }`}>

                  <div className="relative z-10 text-center">
                    {/* Pencil writing on paper icon */}
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-black bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                      <div className="relative">
                        {/* Paper */}
                        <div className="w-16 h-20 bg-white border-3 border-black rounded-sm flex flex-col p-2 gap-1.5 shadow-lg">
                          <div className="w-full h-1 bg-gray-300 rounded"></div>
                          <div className="w-4/5 h-1 bg-gray-300 rounded"></div>
                          <div className="w-full h-1 bg-gray-300 rounded"></div>
                          <div className="w-3/5 h-1 bg-[#72a4f2] rounded"></div>
                        </div>
                        {/* Pencil */}
                        <div className="absolute -bottom-2 -right-3 transform rotate-[-45deg]">
                          <div className="w-2 h-12 bg-[#FFD96E] border-2 border-black rounded-sm shadow-md">
                            <div className="w-full h-3 bg-[#FFA05A] border-b-2 border-black"></div>
                            <div className="absolute -bottom-2 left-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-black"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative inline-block mb-3">
                      <h2 className={`text-2xl font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
                        Write It Myself
                      </h2>
                    </div>

                    <p className="text-gray-600 text-base leading-relaxed">
                      Start from scratch and build your scene line by line!
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Create Scene Button */}
          <div className="mb-8">
            <button
              onClick={handleCreateScene}
              disabled={!selectedMethod}
              className={`group relative px-8 py-4 rounded-xl border-4 border-black font-bold text-xl transition-all duration-300 ${
                selectedMethod
                  ? 'bg-black text-white hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              } ${sunsetSerialMediumFont.className}`}
            >
              <span className="flex items-center gap-3">
                Create Scene
                {selectedMethod && (
                  <FontAwesomeIcon icon={faArrowRight} className="text-lg group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </button>
          </div>

          {/* Decorative accent dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-[#72a4f2] rounded-full opacity-70"></div>
            <div className="w-3 h-3 bg-[#ffa05a] rounded-full opacity-50"></div>
            <div className="w-3 h-3 bg-[#FFD96E] rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SceneCreationMethod
