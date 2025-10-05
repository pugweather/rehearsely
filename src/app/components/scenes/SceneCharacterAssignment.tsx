'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong, faArrowRight, faUser, faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import localFont from 'next/font/local'
import VoiceSelectionModal from './VoiceSelectionModal'
import { useVoicesStore } from '@/app/stores/useVoicesStores'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

interface SceneCharacterAssignmentProps {
  sceneName: string
  fileName: string
}

interface Character {
  name: string
  isMe: boolean
  selectedVoiceId?: string
  selectedVoiceName?: string
}

const SceneCharacterAssignment = ({ sceneName, fileName }: SceneCharacterAssignmentProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isCreatingScene, setIsCreatingScene] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacterForVoice, setSelectedCharacterForVoice] = useState<number | null>(null)
  const router = useRouter()
  const voices = useVoicesStore(s => s.voices)

  // Load characters from script analysis
  useEffect(() => {
    const analysisStr = sessionStorage.getItem('scriptAnalysis')
    const dialogueStr = sessionStorage.getItem('scriptDialogue')

    // Check if required data exists
    if (!analysisStr || !dialogueStr) {
      console.error('❌ Missing required session data')
      console.error('Has scriptAnalysis:', !!analysisStr)
      console.error('Has scriptDialogue:', !!dialogueStr)

      alert('⚠️ Session Data Missing\n\nThe script analysis data is not available. This usually happens if:\n• The page was refreshed\n• The session timed out\n• You navigated here directly without uploading a script\n\nRedirecting to Scenes page...')

      router.push('/scenes')
      return
    }

    const analysis = JSON.parse(analysisStr)
    // Convert character names from analysis to Character objects
    const characterObjects: Character[] = analysis.characters.map((name: string) => ({
      name: name.toUpperCase(), // Display in uppercase
      isMe: false
    }))
    setCharacters(characterObjects)
    console.log('✅ Loaded characters from analysis:', characterObjects)
  }, [])

  // Trigger slide-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleCharacterUpdate = (index: number, updates: Partial<Character>) => {
    setCharacters(prev => prev.map((char, i) => 
      i === index ? { ...char, ...updates } : char
    ))
  }

  const handleSetAsMe = (index: number) => {
    setCharacters(prev => prev.map((char, i) => ({
      ...char,
      isMe: i === index,
      selectedVoiceId: i === index ? undefined : char.selectedVoiceId,
      selectedVoiceName: i === index ? undefined : char.selectedVoiceName
    })))
  }

  const handleVoiceSelected = (voiceId: string) => {
    if (selectedCharacterForVoice !== null) {
      // Find the voice object to get the name
      const voice = voices?.find(v => v.voice_id === voiceId)
      handleCharacterUpdate(selectedCharacterForVoice, {
        selectedVoiceId: voiceId,
        selectedVoiceName: voice?.name || voiceId
      })
      setSelectedCharacterForVoice(null)
    }
  }

  const canCreateScene = () => {
    const hasMyCharacter = characters.some(char => char.isMe)
    const allNonMeHaveVoices = characters.filter(char => !char.isMe).every(char =>
      char.selectedVoiceId
    )
    return hasMyCharacter && allNonMeHaveVoices
  }

  const handleCreateScene = async () => {
    if (!canCreateScene()) return

    setIsCreatingScene(true)

    try {
      // Get dialogue data from sessionStorage
      const dialogueStr = sessionStorage.getItem('scriptDialogue')
      if (!dialogueStr) {
        console.error('No dialogue data found in sessionStorage')
        setIsCreatingScene(false)

        // Show user-friendly error message
        alert('⚠️ Session data expired\n\nYour script analysis data has been lost (possibly due to page refresh or timeout).\n\nPlease go back to the Scenes page and re-upload your script.\n\nTip: Complete character assignment within 30 minutes of uploading to avoid this issue.')

        // Redirect back to scenes page
        setTimeout(() => {
          router.push('/scenes')
        }, 1000)
        return
      }

      const dialogue = JSON.parse(dialogueStr)

      const res = await fetch("/api/private/scenes/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sceneName,
          fileName: fileName,
          characters: characters.map(char => ({
            name: char.name,
            isMe: char.isMe,
            selectedVoice: char.selectedVoiceId // Send voice ID to API
          })),
          dialogue: dialogue
        })
      })

      if (res.ok) {
        const result = await res.json()
        const { sceneId, linesNeedingAudio } = result

        // Store lines that need audio generation for background processing
        if (linesNeedingAudio && linesNeedingAudio.length > 0) {
          sessionStorage.setItem('linesNeedingAudio', JSON.stringify(linesNeedingAudio))
        }

        // Navigate to editor with the newly created scene
        router.push(`/editor/${sceneId}`)
      } else {
        console.log("Error: failed to create scene")
        setIsCreatingScene(false)
      }
    } catch (error) {
      console.error("Error creating scene:", error)
      setIsCreatingScene(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 relative">
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
        
        {/* Header */}
        <div className="flex items-center justify-between p-8">
          <Link
            href="/scenes"
            className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors duration-200 group"
          >
            <div className="w-12 h-12 rounded-full bg-white/70 border-2 border-black flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-200">
              <FontAwesomeIcon icon={faArrowLeftLong} className="text-lg" />
            </div>
            <span className={`text-lg ${sunsetSerialMediumFont.className}`}>Back</span>
          </Link>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-5">

          {/* Scene Title */}
          <div className="text-center mb-2">
            <div className={`text-2xl font-semibold text-gray-700 ${sunsetSerialMediumFont.className}`}>
              "{sceneName}"
            </div>
          </div>

          {/* Main instruction */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
              Assign Characters & Voices
            </h1>
            <p className="text-gray-600 mt-2">Choose which character is you and assign voices to the others</p>
          </div>

          {/* Characters list */}
          <div className="max-w-4xl w-full mb-8">
            <div className="space-y-4">
              {characters.map((character, index) => (
                <div key={character.name} className={`bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl p-6 border-4 transition-all duration-300 ${
                  character.isMe ? 'border-[#72a4f2] shadow-xl' : 'border-black shadow-lg'
                }`}>
                  <div className="flex items-center justify-between">
                    
                    {/* Character info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                        character.isMe ? 'border-[#72a4f2] bg-[#72a4f2] text-white' : 'border-black bg-white'
                      }`}>
                        <FontAwesomeIcon icon={faUser} className="text-xl" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${sunsetSerialMediumFont.className}`}>
                          {character.name}
                        </h3>
                        {character.isMe && (
                          <span className="text-sm text-[#72a4f2] font-semibold">This is me</span>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                      
                      {/* Set as me button */}
                      {!character.isMe && (
                        <button
                          onClick={() => handleSetAsMe(index)}
                          className="px-4 py-2 bg-[#72a4f2] text-white rounded-lg font-semibold hover:bg-[#5a8ae8] transition-colors duration-200"
                        >
                          This is me
                        </button>
                      )}

                      {/* Voice selection button (only for non-me characters) */}
                      {!character.isMe && (
                        <button
                          onClick={() => setSelectedCharacterForVoice(index)}
                          className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 ${
                            character.selectedVoiceName
                              ? 'bg-[#72a4f2] text-white border-2 border-[#72a4f2]'
                              : 'bg-white border-2 border-black hover:bg-gray-50'
                          }`}
                        >
                          <FontAwesomeIcon icon={faVolumeUp} />
                          {character.selectedVoiceName || 'Select Voice'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Scene Button */}
          <div className="mb-8">
            <button
              onClick={handleCreateScene}
              disabled={!canCreateScene() || isCreatingScene}
              className={`group relative px-8 py-4 rounded-xl border-4 border-black font-bold text-xl transition-all duration-300 ${
                canCreateScene() && !isCreatingScene
                  ? 'bg-black text-white hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              } ${sunsetSerialMediumFont.className}`}
            >
              <span className="flex items-center gap-3">
                {isCreatingScene ? (
                  <>
                    Creating Scene...
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    Create Scene
                    {canCreateScene() && (
                      <FontAwesomeIcon icon={faArrowRight} className="text-lg group-hover:translate-x-1 transition-transform" />
                    )}
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Requirements note */}
          {!canCreateScene() && (
            <div className="text-center text-sm text-gray-600 mb-4">
              Please select which character is you and assign voices to all other characters
            </div>
          )}

          {/* Session timeout warning */}
          <div className="text-center text-xs text-gray-500 mb-4 max-w-md mx-auto">
            ⏱️ Complete character assignment soon - session data expires after inactivity
          </div>

          {/* Decorative accent dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-[#72a4f2] rounded-full opacity-70"></div>
            <div className="w-3 h-3 bg-[#ffa05a] rounded-full opacity-50"></div>
            <div className="w-3 h-3 bg-[#FFD96E] rounded-full opacity-40"></div>
          </div>
        </div>
      </div>

      {/* Voice Selection Modal */}
      {selectedCharacterForVoice !== null && (
        <VoiceSelectionModal
          isOpen={selectedCharacterForVoice !== null}
          characterName={characters[selectedCharacterForVoice]?.name || ''}
          onClose={() => setSelectedCharacterForVoice(null)}
          onVoiceSelected={handleVoiceSelected}
        />
      )}
    </div>
  )
}

export default SceneCharacterAssignment
