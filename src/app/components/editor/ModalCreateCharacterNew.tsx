'use client'
import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faPlay, faStop, faVolumeUp, faUser, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import localFont from 'next/font/local'
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import { Voice, LineBeingEditedData, Character } from '@/app/types'
import { useCharacters } from '@/app/context/charactersContext'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

interface ModalCreateCharacterNewProps {
  sceneId: number
  lineBeingEditedData: LineBeingEditedData
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>
  setIsCreateCharModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  originalCharForOpenedLine: Character | null
}

const ModalCreateCharacterNew = ({
  sceneId,
  lineBeingEditedData,
  setLineBeingEditedData,
  setIsCreateCharModalOpen,
  originalCharForOpenedLine
}: ModalCreateCharacterNewProps) => {
  const { characters, setCharacters } = useCharacters()
  const [characterName, setCharacterName] = useState<string>("")
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [playingVoice, setPlayingVoice] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Get real voices from the store
  const voices = useVoicesStore(s => s.voices)
  const voicesCategorized = useVoicesStore(s => s.voicesCategorized)

  const currentAudio = useRef<HTMLAudioElement | null>(null)

  // Trigger fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setSelectedVoice(null)
      setPlayingVoice('')
      setCharacterName("")
      setErrorText(null)
      stopSelectedVoiceAudio()
      // Reset to original character
      setLineBeingEditedData(prev => ({
        ...prev,
        voice: null,
        character: originalCharForOpenedLine
      }))
      setIsCreateCharModalOpen(false)
    }, 200)
  }

  const handleSave = async () => {
    // Validation
    const isDupeName = characters?.find(char => char.name.toLowerCase().trim() === characterName.toLowerCase().trim())
    const noVoiceSelected = selectedVoice === null
    const noNameEntered = characterName.trim() === ''

    if (noNameEntered) {
      setErrorText("Please enter a character name")
      return
    }
    if (isDupeName) {
      setErrorText("A character already has this name")
      return
    }
    if (noVoiceSelected) {
      setErrorText("Please select a voice")
      return
    }

    setIsLoading(true)
    setErrorText(null)

    try {
      const res = await fetch(`/api/private/scenes/${sceneId}/characters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: characterName,
          sceneId: sceneId,
          voiceId: selectedVoice.voice_id
        })
      })

      if (res.ok) {
        const newCharacterRes = await res.json()
        const newCharacter = newCharacterRes.insertedCharacter
        const newCharacterVoice = voices?.find(voice => voice.voice_id === newCharacter.voice_id) || null

        // Append to characters
        setCharacters(prev => {
          return prev == null ? [newCharacter] : [...prev, newCharacter]
        })
        
        // Attach character & voice to current line
        setLineBeingEditedData(prev => ({
          ...prev, 
          character: newCharacter, 
          voice: newCharacterVoice
        }))

        handleClose()
      } else {
        setErrorText("Failed to create character. Please try again.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error creating character:", error)
      setErrorText("Failed to create character. Please try again.")
      setIsLoading(false)
    }
  }

  const playSelectedVoiceAudio = async (voice: Voice) => {
    // Reset audio
    stopSelectedVoiceAudio()
    // Play sample mp3 audio
    const audio = new Audio(voice.preview_url)
    currentAudio.current = audio

    try {
      await currentAudio.current.play()
      setPlayingVoice(voice.voice_id)
    } catch(err) {
      console.error("Audio playback failed", err)
    }

    currentAudio.current.onended = () => {
      setPlayingVoice('')
    }
  }

  const stopSelectedVoiceAudio = async () => {
    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current.currentTime = 0
      currentAudio.current = null
      setPlayingVoice('')
    }
  }

  const getVoicesJSX = (gender: "male" | "female") => {
    if (voicesCategorized === null) return null
    return Object.entries(voicesCategorized).map(([category, voices], categoryIndex) => {
      const hasVoices = voices[gender] && voices[gender].length > 0
      return (
        <div key={categoryIndex} className="mb-8">
          <h4 className="text-base font-bold text-gray-800 uppercase tracking-wider mb-4 border-l-4 border-[#FFA05A] pl-4 py-2">
            {category}
          </h4>
          {hasVoices ? (
            <div className="grid grid-cols-2 gap-3">
              {voices[gender].map((voice, voiceIndex) => (
                <div
                  key={voiceIndex}
                  className={`group relative bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-xl p-4 border-2 cursor-pointer transition-all duration-200 ${
                    selectedVoice?.voice_id === voice.voice_id
                      ? 'border-[#FFA05A] shadow-lg scale-[1.02]'
                      : 'border-black shadow-sm hover:shadow-md hover:scale-[1.01]'
                  }`}
                  onClick={() => setSelectedVoice(voice)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        selectedVoice?.voice_id === voice.voice_id 
                          ? 'bg-[#FFA05A] border-[#FFA05A]' 
                          : 'bg-white border-black group-hover:border-[#FFA05A]'
                      }`}>
                        {selectedVoice?.voice_id === voice.voice_id && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-base font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
                          {voice.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (playingVoice === voice.voice_id) {
                          stopSelectedVoiceAudio()
                        } else {
                          playSelectedVoiceAudio(voice)
                        }
                      }}
                      className={`w-10 h-10 rounded-full border-2 border-black text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 ml-3 ${
                        playingVoice === voice.voice_id
                          ? 'bg-[#FFA05A] animate-pulse'
                          : 'bg-[#72a4f2] hover:bg-[#5a8ae8] hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      disabled={false}
                    >
                      {playingVoice === voice.voice_id ? (
                        <FontAwesomeIcon icon={faStop} className="text-sm" />
                      ) : (
                        <FontAwesomeIcon icon={faPlay} className="text-sm ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center h-11 text-xs text-gray-500 italic">
              <span className="opacity-60">— No {category.toLowerCase()} voices —</span>
            </div>
          )}
        </div>
      )
    })
  }

  const maleCharBtns = getVoicesJSX("male")
  const femaleCharBtns = getVoicesJSX("female")

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] rounded-2xl border-4 border-black shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
      }`}>
        
        {/* Subtle background accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#72a4f2]/8 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 -right-20 w-48 h-48 bg-gradient-to-bl from-[#ffa05a]/6 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 left-1/3 w-36 h-36 bg-gradient-to-tr from-[#FFD96E]/6 to-transparent rounded-full blur-2xl"></div>
        </div>

        {/* Header */}
        <div className='relative z-10 px-8 py-6'>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
                Create New Character
              </h2>
              <div className="text-sm text-gray-600 mt-1">
                Enter a name and select a voice
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="w-12 h-12 rounded-full bg-white/70 border-2 border-black flex items-center justify-center hover:bg-white hover:shadow-md transition-all duration-200 group"
            >
              <FontAwesomeIcon icon={faClose} className="text-lg group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Character Name Input */}
        <div className='relative z-10 px-8 pb-4'>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#72a4f2] border-2 border-black flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
            </div>
            <h3 className={`text-lg font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
              Character Name
            </h3>
          </div>
          <input
            type="text"
            placeholder="Enter character name..."
            value={characterName}
            onChange={(e) => {
              setCharacterName(e.target.value)
              setErrorText(null)
            }}
            className="w-full px-4 py-3 rounded-xl border-3 border-black bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#72a4f2] focus:border-[#72a4f2] transition-all duration-200 font-medium text-lg"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              borderColor: errorText ? '#dc2626' : '#000000'
            }}
          />
          {errorText && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
              ⚠️ {errorText}
            </p>
          )}
        </div>

        {/* Voice Selection */}
        <div className='relative z-10 px-8 py-4'>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#ffa05a] border-2 border-black flex items-center justify-center">
              <FontAwesomeIcon icon={faVolumeUp} className="text-white text-sm" />
            </div>
            <h3 className={`text-lg font-bold text-gray-800 ${sunsetSerialMediumFont.className}`}>
              Select Voice
            </h3>
            <span className="text-sm text-gray-600 font-medium ml-2 mt-2">Click play to preview</span>
          </div>
        </div>

        {/* Body */}
        <div className='relative z-10 flex-1 px-8 py-4 overflow-y-auto min-h-0'>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className={`text-xl font-bold text-gray-800 mb-4 ${sunsetSerialMediumFont.className}`}>
                Female Voices
              </h3>
              {femaleCharBtns && femaleCharBtns.length > 0 ? (
                femaleCharBtns
              ) : (
                <div className="flex items-center justify-center h-20 text-sm rounded-xl border-2 border-dashed border-gray-300 bg-white/50">
                  <p className="text-center text-gray-500">No female voices available</p>
                </div>
              )}
            </div>
            <div>
              <h3 className={`text-xl font-bold text-gray-800 mb-4 ${sunsetSerialMediumFont.className}`}>
                Male Voices
              </h3>
              {maleCharBtns && maleCharBtns.length > 0 ? (
                maleCharBtns
              ) : (
                <div className="flex items-center justify-center h-20 text-sm rounded-xl border-2 border-dashed border-gray-300 bg-white/50">
                  <p className="text-center text-gray-500">No male voices available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='relative z-10 px-8 py-6 flex items-center justify-end gap-4'>
          <button 
            onClick={handleClose}
            className="px-6 py-3 rounded-xl border-2 border-black bg-white/70 font-semibold text-gray-800 hover:bg-white hover:shadow-md transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedVoice || !characterName.trim() || isLoading}
            className={`px-6 py-3 rounded-xl border-2 border-black font-semibold transition-all duration-200 flex items-center gap-2 ${
              selectedVoice && characterName.trim() && !isLoading
                ? 'bg-[#72a4f2] text-white hover:bg-[#5a8ae8] hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCircleCheck} />
                Create Character
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalCreateCharacterNew
