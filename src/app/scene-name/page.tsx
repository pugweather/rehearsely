'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import Link from 'next/link'
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
    <div className="flex flex-col">
        <Navbar />
        <div className='h-full text-black flex-grow flex-col flex items-center justify-center'>
          <div className='flex flex-col items-center mt-[10rem]'>
              <h1 className={`text-4xl mb-5 font-semibold ${sunsetSerialMediumFont.className}`}>Enter the name for your scene</h1>
              <div className='flex items-center'>
                  <Link href="/scenes">
                    <span className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ease-in-out text-2xl mr-2">
                      <FontAwesomeIcon icon={faArrowLeftLong} />
                      <span className={`ml-2 ${sunsetSerialMediumFont.className}`}>Back</span>
                    </span>
                  </Link>
                  <input 
                    type="text" 
                    placeholder="Enter scene name" 
                    className="input input-lg min-w-[30rem] mr-2" 
                    onChange={(e) => setSceneName(e.target.value)}
                  />
                  <button 
                    onClick={handleSubmit} 
                    className={clsx(
                      'btn btn-lg default-btn black grow-on-hover',
                      saveDisabled && "opacity-50 pointer-events-none"
                    )}
                    style={saveDisabled ? {cursor: "auto"} : undefined}
                    disabled={saveDisabled}
                  >
                    Save
                    {/* <ButtonLink 
                      text={isLoading ?  'Saving Changes...' : 'Save'}
                      bgColor={isLoading ? "#ccc" : undefined}
                      className={clsx(
                        'px-4 py-2 text-xl',
                        saveDisabled && "opacity-50 pointer-events-none"
                      )}
                    /> */}
                  </button>
              </div>
          </div>
        </div>
    </div>
  )
}

export default SceneNamePage