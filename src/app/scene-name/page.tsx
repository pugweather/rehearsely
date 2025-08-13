'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import ButtonLink from '../components/ui/ButtonLink'
import localFont from 'next/font/local';
import clsx from 'clsx'

const sunsetSerialMediumFont = localFont({
    src: "../../../public/fonts/sunsetSerialMedium.ttf",
})

const SceneNamePage = () => {

  const [sceneName, setSceneName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const saveDisabled = sceneName.length === 0

  const handleSubmit = async () => {

    if (isLoading) return true

    setIsLoading(true)

    const res = await fetch("/api/private/scenes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: sceneName
        // user_id already being handled in scenes API route
      })
    })

    if (res.ok) {
      const result = await res.json()
      const {sceneId} = result
      router.push(`/editor/${sceneId}`);
    } else {

    }
  }

  return (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className='h-full text-black flex-grow flex-col flex items-center justify-center'>
          <div className='flex flex-col items-center -mt-15'>
              <h1 className={`text-2xl mb-5 font-semibold ${sunsetSerialMediumFont.className}`}>Enter the name for your scene</h1>
              <div className='flex items-center'>
                  <input 
                      type="text" 
                      placeholder="Enter scene name"
                      className="relative w-125 h-12.5 pl-7.5 mr-4 text-lg border border-gray-300 rounded-3xl outline-none placeholder-gray-400 bg-white"
                      onChange={(e) => setSceneName(e.target.value)}
                  />
                  <button 
                    onClick={handleSubmit} 
                    className='text-lg'
                    style={saveDisabled ? {cursor: "auto"} : undefined}
                    disabled={saveDisabled}
                  >
                    <ButtonLink 
                      text={isLoading ?  'Saving Changes...' : 'Save'}
                      bgColor={isLoading ? "#ccc" : undefined}
                      className={clsx(
                        'px-4 py-2 text-xl',
                        saveDisabled && "opacity-50 pointer-events-none"
                      )}
                    />
                  </button>
              </div>
          </div>
        </div>
    </div>
  )
}

export default SceneNamePage