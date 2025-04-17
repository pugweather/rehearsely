'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import ButtonLink from '../components/ui/ButtonLink'

const SceneNamePage = () => {

  const [sceneName, setSceneName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleSubmit = async () => {

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
      setIsLoading(false)
      const result = await res.json()
      const { sceneId } = result
      router.push(`/editor/${sceneId}`);
    } else {

    }
  }

  return (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className='h-full text-black flex-grow flex-col flex items-center justify-center'>
          <div className='flex flex-col items-center -mt-15'>
              <h1 className='text-2xl mb-5 font-semibold'>Enter the name for your scene</h1>
              <div className='flex items-center'>
                  <input 
                      type="text" 
                      placeholder="Enter scene name"
                      className="relative w-125 h-15 pl-7.5 mr-4 text-lg border border-gray-300 rounded-3xl outline-none placeholder-gray-400"
                      onChange={(e) => setSceneName(e.target.value)}
                  />
                  <button onClick={handleSubmit}>
                    <ButtonLink 
                      text={isLoading ?  'Saving Changes...' : 'Save'}
                      bgColor={isLoading ? "#ccc" : undefined}
                    />
                  </button>
              </div>
          </div>
        </div>
    </div>
  )
}

export default SceneNamePage