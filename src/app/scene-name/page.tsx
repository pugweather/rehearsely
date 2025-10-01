'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import Link from 'next/link'
import { faArrowLeftLong, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ButtonLink from '../components/ui/ButtonLink'
import localFont from 'next/font/local'
import clsx from 'clsx'

const sunsetSerialMediumFont = localFont({
    src: "../../../public/fonts/sunsetSerialMedium.ttf",
})

const SceneNamePage = () => {

  const [sceneName, setSceneName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
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
      
      // Start swipe transition
      setIsTransitioning(true)
      
      // Navigate after a short delay to show the swipe effect
      setTimeout(() => {
        router.push(`/scene-creation-method?sceneId=${sceneId}&sceneName=${encodeURIComponent(sceneName)}`)
      }, 300)
    } else {
      setIsLoading(false)
      console.log("Error: failed to create scene")
    }
  }

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Background with theatrical gradient accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc]"></div>

      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#72a4f2]/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-bl from-[#ffa05a]/6 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-tr from-[#FFD96E]/6 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        <Navbar />
        <div className={`flex-grow text-black flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          isTransitioning ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}>
          <div className='flex flex-col items-center'>
              <h1 className={`text-4xl mb-8 font-semibold ${sunsetSerialMediumFont.className}`}>Enter the name for your scene</h1>
              <div className='flex items-center gap-3'>
                  <Link href="/scenes">
                    <div className="w-12 h-12 rounded-full bg-white/70 border-2 border-black flex items-center justify-center hover:bg-white hover:shadow-md transition-all duration-200">
                      <FontAwesomeIcon icon={faArrowLeftLong} className="text-lg" />
                    </div>
                  </Link>
                  <input
                    type="text"
                    placeholder="Enter scene name"
                    className="input input-lg min-w-[30rem] border-3 border-black shadow-md focus:shadow-lg transition-shadow"
                    onChange={(e) => setSceneName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !saveDisabled && !isLoading) {
                        handleSubmit()
                      }
                    }}
                  />
                  <button
                    onClick={handleSubmit}
                    className={clsx(
                      'w-12 h-12 rounded-full bg-black text-white flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5',
                      (saveDisabled || isLoading) && "opacity-50 pointer-events-none"
                    )}
                    style={(saveDisabled || isLoading) ? {cursor: "auto"} : undefined}
                    disabled={saveDisabled || isLoading}
                    title="Next"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FontAwesomeIcon icon={faArrowRight} className="text-lg" />
                    )}
                  </button>
              </div>

              {/* Decorative accent dots */}
              <div className="flex justify-center space-x-2 pt-8">
                <div className="w-3 h-3 bg-[#72a4f2] rounded-full opacity-70"></div>
                <div className="w-3 h-3 bg-[#ffa05a] rounded-full opacity-50"></div>
                <div className="w-3 h-3 bg-[#FFD96E] rounded-full opacity-40"></div>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SceneNamePage