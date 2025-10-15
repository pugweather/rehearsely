'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import SceneUploadProcessing from '../components/scenes/SceneUploadProcessing'

const SceneUploadProcessingPage = () => {
  const searchParams = useSearchParams()
  const sceneName = searchParams.get('sceneName') || ''
  const fileName = searchParams.get('fileName') || ''

  if (!sceneName || !fileName) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Missing Upload Information</h1>
            <p className="text-gray-600">Please go back and select a file to upload.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <SceneUploadProcessing
        key={`${fileName}-${Date.now()}`}
        sceneName={sceneName}
        fileName={fileName}
      />
    </div>
  )
}

export default SceneUploadProcessingPage
