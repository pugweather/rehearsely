'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileText, faUsers, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Tesseract from 'tesseract.js'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

// Declare global type for pdf.js from CDN
declare global {
    interface Window {
        pdfjsLib: any
    }
}

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
    // Get the file from sessionStorage
    const fileDataStr = sessionStorage.getItem('uploadFile')
    if (!fileDataStr) {
      console.error('No file data found')
      return
    }

    const fileData = JSON.parse(fileDataStr)

    try {
      // Load PDF.js if not already loaded
      if (!window.pdfjsLib) {
        setCurrentWord('Loading PDF library...')
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'

        await new Promise((resolve, reject) => {
          script.onload = () => {
            if (window.pdfjsLib) {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
              resolve(true)
            }
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      setCurrentWord('Analyzing PDF...')

      // Convert base64 to ArrayBuffer
      const base64Data = fileData.data.split(',')[1]
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Load PDF document
      const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise
      const numPages = pdf.numPages

      console.log(`PDF has ${numPages} page(s)`)

      let fullText = ''

      // Process each page (OCR takes 0-90%)
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setCurrentWord(`Processing page ${pageNum} of ${numPages}...`)

        // Get the page
        const page = await pdf.getPage(pageNum)

        // Get viewport at 2x scale for better OCR accuracy
        const viewport = page.getViewport({ scale: 2.0 })

        // Create canvas
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) continue

        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        // Convert canvas to blob for Tesseract
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png')
        })

        // Use Tesseract to extract text from the image
        const result = await Tesseract.recognize(
          blob,
          'eng',
          {
            logger: (m) => {
              if (m.status === 'recognizing text') {
                // OCR progress takes 0-90% of total progress
                const pageProgress = ((pageNum - 1) / numPages) * 90
                const ocrProgress = (m.progress / numPages) * 90
                const totalProgress = Math.min(90, Math.round(pageProgress + ocrProgress))
                setProgress(totalProgress)
              }
            }
          }
        )

        // Add page text to full text
        fullText += `\n--- PAGE ${pageNum} ---\n`
        fullText += result.data.text
        fullText += '\n'

        console.log(`Page ${pageNum} extracted (Confidence: ${result.data.confidence}%)`)
      }

      // Log the complete extracted text
      console.log('TEXT EXTRACTED FROM PDF:')
      console.log(fullText)

      // Analyze script with OpenAI (LLM analysis takes 90-100%)
      setProgress(90)
      setCurrentWord('Analyzing characters...')

      // Estimate LLM analysis time based on text length
      const textLength = fullText.length
      const estimatedSeconds = Math.min(10, Math.max(3, textLength / 1000)) // 3-10 seconds based on text
      const progressInterval = 100 / estimatedSeconds // Progress per 100ms

      // Start progress animation
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + progressInterval / 10
          return Math.min(98, newProgress) // Cap at 98% until actual completion
        })
      }, 100)

      const analysisResponse = await fetch('/api/private/scenes/analyze-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scriptText: fullText })
      })

      // Clear progress animation
      clearInterval(progressTimer)
      setProgress(99)

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze script')
      }

      const { analysis } = await analysisResponse.json()

      console.log('SCRIPT ANALYSIS:')
      console.log('Characters:', analysis.characters)
      console.log('Dialogue lines:', analysis.dialogue.length)

      // Store analysis in sessionStorage for the next screen
      sessionStorage.setItem('scriptAnalysis', JSON.stringify(analysis))
      sessionStorage.setItem('extractedText', fullText)

      // Store ordered character-line mapping for scene creation
      // This will be used to create lines in the editor with proper ordering
      sessionStorage.setItem('scriptDialogue', JSON.stringify(analysis.dialogue))

      // Complete!
      setProgress(100)
      setCurrentWord('Complete!')
      setIsComplete(true)

      // Navigate to character assignment
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/scene-character-assignment?sceneName=${encodeURIComponent(sceneName)}&fileName=${encodeURIComponent(fileName)}`)

    } catch (error) {
      console.error('❌ Error extracting text from PDF:', error)
      setCurrentWord('Error processing PDF')
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
