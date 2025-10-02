'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import SceneCharacterAssignment from '../components/scenes/SceneCharacterAssignment'

const SceneCharacterAssignmentPage = () => {
  const searchParams = useSearchParams()
  const sceneName = searchParams.get('sceneName') || ''
  const fileName = searchParams.get('fileName') || ''

  if (!sceneName || !fileName) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Missing Scene Information</h1>
            <p className="text-gray-600">Please go back and upload a file first.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <SceneCharacterAssignment sceneName={sceneName} fileName={fileName} />
    </>
  )
}

export default SceneCharacterAssignmentPage
