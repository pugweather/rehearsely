'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import SceneCreationMethod from '../components/scenes/SceneCreationMethod'

const SceneCreationMethodPage = () => {
  const searchParams = useSearchParams()
  const sceneId = searchParams.get('sceneId') || ''
  const sceneName = searchParams.get('sceneName') || ''

  if (!sceneName) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Missing Scene Information</h1>
            <p className="text-gray-600">Please go back and create a scene first.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <SceneCreationMethod sceneId={sceneId} sceneName={sceneName} />
    </div>
  )
}

export default SceneCreationMethodPage
