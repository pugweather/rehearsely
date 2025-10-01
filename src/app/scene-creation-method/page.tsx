'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import SceneCreationMethod from '../components/scenes/SceneCreationMethod'

const SceneCreationMethodPage = () => {
  const searchParams = useSearchParams()
  const sceneId = searchParams.get('sceneId') || ''
  const sceneName = searchParams.get('sceneName') || ''

  if (!sceneId || !sceneName) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
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
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <SceneCreationMethod sceneId={sceneId} sceneName={sceneName} />
      </div>
    </div>
  )
}

export default SceneCreationMethodPage
