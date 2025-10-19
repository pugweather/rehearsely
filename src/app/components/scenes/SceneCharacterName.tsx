'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import localFont from 'next/font/local'
import clsx from 'clsx'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

interface SceneCharacterNameProps {
  sceneName: string
  onBack: () => void
}

const SceneCharacterName = ({ sceneName, onBack }: SceneCharacterNameProps) => {
  const [characterName, setCharacterName] = useState('')
  const [isCreatingScene, setIsCreatingScene] = useState(false)
  const [isBackLoading, setIsBackLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  const saveDisabled = characterName.length === 0

  // Trigger fade-in animation on mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleBack = () => {
    setIsBackLoading(true)
    // Fade out current screen
    setIsVisible(false)
    setTimeout(() => {
      onBack()
    }, 200)
  }

  const handleCreateScene = async () => {
    if (isCreatingScene) return
    if (!characterName.trim()) return

    setIsCreatingScene(true)

    // Start fade transition
    setIsTransitioning(true)

    try {
      // First, create the scene
      const sceneRes = await fetch("/api/private/scenes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sceneName
        })
      })

      if (!sceneRes.ok) {
        console.log("Error: failed to create scene")
        setIsCreatingScene(false)
        return
      }

      const sceneResult = await sceneRes.json()
      const { sceneId } = sceneResult

      // Then, create the "me" character
      const characterRes = await fetch(`/api/private/scenes/${sceneId}/characters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: characterName.trim(),
          sceneId: sceneId,
          isMe: true
        })
      })

      if (!characterRes.ok) {
        console.log("Error: failed to create character")
        setIsCreatingScene(false)
        return
      }
        
      // Navigate to editor with fade delay
      setTimeout(() => {
        router.push(`/editor/${sceneId}`)
      }, 200)
    } catch (error) {
      console.error("Error creating scene:", error)
      setIsCreatingScene(false)
    }
  }


  return (
    <div className="h-full flex flex-col relative flex-1 overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#72a4f2]/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-bl from-[#ffa05a]/6 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-tr from-[#FFD96E]/6 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className={`relative z-10 -m-11 flex-1 text-black flex flex-col items-center justify-center transition-all duration-300 ease-out ${
        isTransitioning ? 'opacity-0' : isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
          <div className='flex flex-col items-center'>
            {/* Scene Title */}
            <div className="text-center mb-4">
              <div className={`text-2xl font-semibold text-gray-700 ${sunsetSerialMediumFont.className}`}>
                "{sceneName}"
              </div>
            </div>
            
            <h1 className={`text-4xl mb-8 font-semibold ${sunsetSerialMediumFont.className}`}>What is your character's name?</h1>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleBack}
                disabled={isBackLoading}
                className={`w-12 h-12 rounded-full bg-white/70 border-2 border-black flex items-center justify-center transition-all duration-200 ${
                  isBackLoading 
                    ? 'cursor-not-allowed opacity-70 scale-95' 
                    : 'hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {isBackLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FontAwesomeIcon icon={faArrowLeftLong} className="text-lg" />
                )}
              </button>
              <input
                type="text"
                placeholder="Enter character name"
                className="input input-lg min-w-[30rem] border-3 border-black shadow-md focus:shadow-lg transition-shadow"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !saveDisabled && !isCreatingScene) {
                    handleCreateScene()
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleCreateScene}
                disabled={saveDisabled || isCreatingScene}
                className={`group relative px-8 py-4 rounded-xl border-4 border-black font-bold text-xl transition-all duration-300 ${
                  !saveDisabled && !isCreatingScene
                    ? 'bg-black text-white hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                } ${sunsetSerialMediumFont.className}`}
              >
                <span className="flex items-center gap-3">
                  {isCreatingScene ? (
                    <>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                      </div>
                      Creating Scene...
                    </>
                  ) : (
                    <>
                      Create Scene
                      {!saveDisabled && (
                        <FontAwesomeIcon icon={faArrowRight} className="text-lg group-hover:translate-x-1 transition-transform" />
                      )}
                    </>
                  )}
                </span>
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
  )
}

export default SceneCharacterName
