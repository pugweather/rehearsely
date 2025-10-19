'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faFilePdf, faTheaterMasks, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
  src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

interface SceneUploadErrorProps {
  sceneName: string
  errorMessage?: string
}

const SceneUploadError = ({ sceneName, errorMessage }: SceneUploadErrorProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string} | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    router.push('/scene-creation-method?sceneName=' + encodeURIComponent(sceneName))
  }

  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsProcessing(true)

        // Clear any previous upload data first
        sessionStorage.removeItem('uploadFile')
        sessionStorage.removeItem('uploadFormData')
        sessionStorage.removeItem('scriptAnalysis')
        sessionStorage.removeItem('extractedText')
        sessionStorage.removeItem('scriptDialogue')

        // Store file data and navigate to processing
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64 = event.target?.result as string

          sessionStorage.setItem('uploadFile', JSON.stringify({
            name: file.name,
            size: file.size,
            type: 'application/pdf',
            data: base64
          }))
          sessionStorage.setItem('uploadFormData', 'file-selected')

          // Navigate to processing screen
          router.push(`/scene-upload-processing?sceneName=${encodeURIComponent(sceneName)}&fileName=${encodeURIComponent(file.name)}`)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <div className="flex flex-col flex-1 relative mt-[125px]">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#72a4f2]/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-bl from-[#ffa05a]/6 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-tr from-[#FFD96E]/6 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Main content with fade animation */}
      <div className={`relative z-10 flex flex-col h-full transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">

          {/* Scene Title */}
          <div className="text-center mb-8">
            <div className={`text-2xl font-semibold text-gray-700 ${sunsetSerialMediumFont.className}`}>
              "{sceneName}"
            </div>
          </div>

          {/* Error card - big and centered */}
          <div className="bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl p-12 border-4 border-black shadow-2xl max-w-3xl w-full mb-8">

            {/* Error icon with theatrical flair */}
            <div className="text-center mb-8">
              <div className="relative w-32 h-32 mx-auto">
                {/* Main circle */}
                <div className="absolute inset-0 rounded-full border-4 border-black bg-white flex items-center justify-center">
                  <FontAwesomeIcon icon={faTheaterMasks} className="text-5xl text-[#FFA05A]" />
                </div>
                {/* Exclamation mark overlay - red warning badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#ef4444] border-3 border-black flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">!</span>
                </div>
              </div>
            </div>

            {/* Error title */}
            <div className="text-center mb-6">
              <h1 className={`text-4xl font-bold text-gray-800 mb-3 ${sunsetSerialMediumFont.className}`}>
                Uh Oh! Plot Twist
              </h1>
              <div className={`text-2xl text-[#ef4444] font-semibold ${sunsetSerialMediumFont.className}`}>
                We Couldn't Find the Scene
              </div>
            </div>

            {/* Error message */}
            <div className="text-center mb-8">
              <p className="text-xl text-gray-700 leading-relaxed">
                {errorMessage || "We couldn't find any characters or dialogue in this PDF. It might be the wrong file, or perhaps this scene needs some improvisation!"}
              </p>
            </div>

            {/* Instructional text and buttons inside card */}
            <div className="text-center border-t-2 border-gray-300 pt-8">
              <p className={`text-lg text-gray-700 mb-6 ${sunsetSerialMediumFont.className}`}>
                Would you like to upload another scene?
              </p>

              {/* Action buttons - horizontally aligned with spacing */}
              <div className="flex items-center justify-center gap-8">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="group flex items-center gap-3 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-white/70 border-2 border-black flex items-center justify-center transition-all duration-200 group-hover:bg-white group-hover:shadow-md group-hover:-translate-y-0.5">
                <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
              </div>
              <span className={`text-xl font-semibold text-gray-800 ${sunsetSerialMediumFont.className}`}>
                Back
              </span>
            </button>

            {/* Upload PDF button */}
            <button
              onClick={handleFileUpload}
              disabled={isProcessing}
              className={`px-6 py-3 bg-gradient-to-br from-[#72a4f2] to-[#5b8fd9] rounded-xl border-3 border-black font-bold text-lg transition-all duration-300 group relative overflow-hidden ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'
              } ${sunsetSerialMediumFont.className}`}
            >
              {/* Subtle shine effect on hover */}
              {!isProcessing && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              )}

              <span className="flex items-center gap-2 relative z-10 text-white">
                {isProcessing ? (
                  <>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                    </div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFilePdf} className="text-base" />
                    Upload New PDF
                  </>
                )}
              </span>
            </button>
              </div>
            </div>
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

export default SceneUploadError
