"use client"
import React, { useState, useRef } from 'react'
import Modal from '../ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faCircleCheck, faXmark, faPlay } from '@fortawesome/free-solid-svg-icons'
import Input from '../ui/Input'
import ButtonLink from '../ui/ButtonLink'
import clsx from 'clsx'
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import { LineBeingEditedData, Voice } from '@/app/types'
import { Character } from '@/app/types'
import "dotenv/config";
import { useCharacters } from '@/app/context/charactersContext'

type Props =  {
  sceneId: number;
  lineBeingEditedData: LineBeingEditedData,
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>
  setIsCreateCharModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  originalCharForOpenedLine: Character | null
}

const ModalCreateCharacter = ({setIsCreateCharModalOpen, setLineBeingEditedData, originalCharForOpenedLine, lineBeingEditedData, sceneId}: Props) => {

    const {characters, setCharacters} = useCharacters()
    const [characterName, setCharacterName] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    const [errorText, setErrorText] = useState<string | null>(null)
    const [audioIsPlaying, setAudioIsPlaying] = useState<boolean>(false)

    const voices = useVoicesStore(s => s.voices)
    const voicesCategorized = useVoicesStore(s => s.voicesCategorized)
    
    const selectedVoiceId = lineBeingEditedData.voice?.voice_id
    const saveCharBtnDisabled = (characterName.trim() === '' || selectedVoiceId == null)
    const playVoiceBtnDisabled = selectedVoiceId == null

    console.log(lineBeingEditedData)

    const currentAudio = useRef<HTMLAudioElement | null>(null)

    const playSelectedVoiceAudio = async () => {
        if (!selectedVoiceId) {
            console.error("No voice selected?! This should never happen!")
            return
        }
        // Reset audio
        stopSelectedVoiceAudio()
        // Play sample mp3 audio
        const selectedVoiceSrc = lineBeingEditedData?.voice?.preview_url
        const audio = new Audio(selectedVoiceSrc)
        currentAudio.current = audio

        try {
            await currentAudio.current.play()
            setAudioIsPlaying(true)
        } catch(err) {
            console.error("Audio playback failed", err)
        }

        currentAudio.current.onended = () => {
            setAudioIsPlaying(false)
        }
    };

    const stopSelectedVoiceAudio = async () => {
        if (currentAudio.current) {
            currentAudio.current.pause();
            currentAudio.current.currentTime = 0;
            currentAudio.current = null
            setAudioIsPlaying(false)
        }
    };
    
    const handleTypingInInputBox = (str: string) => {
        setErrorText(null)
        setCharacterName(str)
    }

    const handleAddNewCharacter = async () => {

        let isDupeName = characters?.find(char => char.name.toLowerCase().trim() === characterName)
        let noVoiceSelected = lineBeingEditedData?.voice === null
        console.log(isDupeName)
        if (isDupeName) {
            setErrorText("* Error: A character already has this name")
        } else if (noVoiceSelected) {
            setErrorText("* Error: You must select a voice")
        } else {

            setIsLoading(true)

            const res = await fetch(`/api/private/scenes/${sceneId}/characters`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: characterName,
                    sceneId: sceneId,
                    voiceId: selectedVoiceId
                })
            })

            if (res.ok) {

                setIsLoading(false)

                const newCharacterRes = await res.json()
                const newCharacter = newCharacterRes.insertedCharacter
                const newCharacterVoice = voices?.find(voice => voice.voice_id === newCharacter.voice_id) || null

                // Append to characters,
                setCharacters(prev => {
                    return prev == null ? [newCharacter] : [...prev, newCharacter]
                })
                // Attach character & voice to current line
                setLineBeingEditedData(prev => {
                    const updated = {...prev, character: newCharacter, voice: newCharacterVoice}
                    console.log("updated lineBeingEditedData:", updated)
                    return updated
                })

                closeCreateCharModal()

            } else {
                setIsLoading(false)
            }
        }
    }

    // Closing entire modal
    const closeCreateCharModal = () => {
        // Unset selected voice
        setLineBeingEditedData(prev=> {
            return {
                ...prev,
                voice: null,
                character: originalCharForOpenedLine
            }
        })
        setIsCreateCharModalOpen(false)
    }

    const handleSelectVoice = (voice: Voice) => {

        const isAlreadySelected = voice.voice_id === lineBeingEditedData?.voice?.voice_id

        // Deselect if it was selected
        if (isAlreadySelected) {
            setLineBeingEditedData(prev => {
                return {
                    ...prev,
                    voice: null
                }
            })
        // Otherwise select
        } else {
            setLineBeingEditedData(prev => {
                return {
                    ...prev,
                    voice: voice
                }
            })
        }   
    }

    const getVoicesJSX = (gender: "male" | "female") =>{
        if (voicesCategorized === null) return null
        return Object.entries(voicesCategorized).map(([category, voices], categoryIndex) => {
            const hasVoices = voices[gender] && voices[gender].length > 0;
            return (
                <div key={categoryIndex} className="mb-6">
                    <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-l-4 border-orange-300 pl-3">
                        {category}
                    </h5>
                    {hasVoices ? (
                        <div className="grid grid-cols-2 gap-2 min-h-[44px]">
                            {voices[gender].map((voice, voiceIndex) => {
                                return (
                                    <button
                                        key={voiceIndex}
                                        className="px-4 py-3 rounded-xl text-sm font-medium text-center cursor-pointer transition-all duration-300 border-2 hover:scale-105"
                                        style={{
                                            backgroundColor: voice.voice_id === selectedVoiceId
                                                ? '#FFA05A'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            borderColor: voice.voice_id === selectedVoiceId
                                                ? '#FFA05A'
                                                : 'rgba(255, 160, 90, 0.3)',
                                            color: voice.voice_id === selectedVoiceId
                                                ? '#ffffff'
                                                : '#202020',
                                            boxShadow: voice.voice_id === selectedVoiceId
                                                ? '0 8px 20px rgba(255, 160, 90, 0.3)'
                                                : '0 4px 10px rgba(0, 0, 0, 0.05)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (voice.voice_id !== selectedVoiceId) {
                                                e.currentTarget.style.backgroundColor = '#ffffff'
                                                e.currentTarget.style.borderColor = '#FFA05A'
                                                e.currentTarget.style.color = '#FFA05A'
                                                e.currentTarget.style.boxShadow = '0 6px 15px rgba(255, 160, 90, 0.2)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (voice.voice_id !== selectedVoiceId) {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
                                                e.currentTarget.style.borderColor = 'rgba(255, 160, 90, 0.3)'
                                                e.currentTarget.style.color = '#202020'
                                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)'
                                            }
                                        }}
                                        onClick={() => handleSelectVoice(voice)}
                                    >
                                        {voice.name}
                                    </button>
                                )
                            })}
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
        <Modal width={700} height={750}>
            <div className='flex flex-col h-full rounded-2xl overflow-hidden' style={{
                background: 'linear-gradient(145deg, #E8DDD0 0%, #E3D6C6 50%, #DDD0C1 100%)',
                border: '1px solid rgba(255, 160, 90, 0.2)',
                boxShadow: '0 20px 40px rgba(255, 160, 90, 0.1)'
            }}>
                {/* Header */}
                <div className='relative px-6 py-6 border-b' style={{
                    borderColor: 'rgba(255, 160, 90, 0.2)',
                    background: 'linear-gradient(90deg, rgba(255, 160, 90, 0.05) 0%, rgba(255, 160, 90, 0.02) 100%)'
                }}>
                    <div className='text-2xl font-bold text-black'>
                        Create New Character
                    </div>
                    <button
                        onClick={closeCreateCharModal}
                        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{
                            backgroundColor: 'rgba(255, 160, 90, 0.1)',
                            color: '#FFA05A',
                            border: '1px solid rgba(255, 160, 90, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 160, 90, 0.2)'
                            e.currentTarget.style.borderColor = '#FFA05A'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 160, 90, 0.1)'
                            e.currentTarget.style.borderColor = 'rgba(255, 160, 90, 0.2)'
                        }}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-5 overflow-y-auto">
                    {/* Character Name Section */}
                    <div className="mb-8">
                        <label className="block text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#8B4513'}}>
                            🎭 Character Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter character name..."
                                value={characterName || ''}
                                onChange={(e) => handleTypingInInputBox(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl text-base border-0 focus:outline-none transition-all duration-300"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    color: '#202020',
                                    border: '2px solid rgba(255, 160, 90, 0.3)',
                                    boxShadow: '0 4px 12px rgba(255, 160, 90, 0.1)'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff'
                                    e.currentTarget.style.boxShadow = `0 8px 25px rgba(255, 160, 90, 0.2)`
                                    e.currentTarget.style.borderColor = '#FFA05A'
                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 160, 90, 0.1)'
                                    e.currentTarget.style.borderColor = 'rgba(255, 160, 90, 0.3)'
                                    e.currentTarget.style.transform = 'translateY(0px)'
                                }}
                            />
                        </div>
                        {errorText && (
                            <p className="mt-3 text-sm flex items-center gap-2" style={{color: '#dc2626'}}>
                                ⚠️ {errorText}
                            </p>
                        )}
                    </div>

                    {/* Voice Selection Section */}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold mb-5" style={{color: '#8B4513'}}>
                            Select Voice
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Male Voices */}
                            <div className="space-y-4 p-4 rounded-xl" style={{
                                background: 'linear-gradient(135deg, rgba(255, 160, 90, 0.05) 0%, rgba(255, 160, 90, 0.02) 100%)',
                                border: '1px solid rgba(255, 160, 90, 0.2)'
                            }}>
                                <h4 className="text-base font-bold pb-3 border-b" style={{
                                    color: '#8B4513',
                                    borderColor: 'rgba(255, 160, 90, 0.3)'
                                }}>
                                    MALE VOICES
                                </h4>
                                <div className="space-y-3">
                                    {maleCharBtns && maleCharBtns.length > 0 ? (
                                        maleCharBtns
                                    ) : (
                                        <div className="flex items-center justify-center h-20 text-sm rounded-xl border-2 border-dashed" style={{
                                            color: '#999',
                                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                            borderColor: 'rgba(255, 160, 90, 0.3)'
                                        }}>
                                            <p className="text-center">No male voices available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Female Voices */}
                            <div className="space-y-4 p-4 rounded-xl" style={{
                                background: 'linear-gradient(135deg, rgba(255, 160, 90, 0.05) 0%, rgba(255, 160, 90, 0.02) 100%)',
                                border: '1px solid rgba(255, 160, 90, 0.2)'
                            }}>
                                <h4 className="text-base font-bold pb-3 border-b" style={{
                                    color: '#8B4513',
                                    borderColor: 'rgba(255, 160, 90, 0.3)'
                                }}>
                                    FEMALE VOICES
                                </h4>
                                <div className="space-y-3">
                                    {femaleCharBtns && femaleCharBtns.length > 0 ? (
                                        femaleCharBtns
                                    ) : (
                                        <div className="flex items-center justify-center h-20 text-sm rounded-xl border-2 border-dashed" style={{
                                            color: '#999',
                                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                            borderColor: 'rgba(255, 160, 90, 0.3)'
                                        }}>
                                            <p className="text-center">No female voices available</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='mt-auto px-6 py-4 flex items-center justify-between gap-3 border-t' style={{borderColor: 'rgba(32,32,32,0.1)'}}>
                    <button
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                            playVoiceBtnDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={playVoiceBtnDisabled}
                        onClick={audioIsPlaying ? stopSelectedVoiceAudio : playSelectedVoiceAudio}
                        style={{
                            backgroundColor: playVoiceBtnDisabled ? '#ccc' : '#FFA05A',
                            color: '#ffffff'
                        }}
                        onMouseEnter={(e) => {
                            if (!playVoiceBtnDisabled) e.currentTarget.style.backgroundColor = '#FF8A3A'
                        }}
                        onMouseLeave={(e) => {
                            if (!playVoiceBtnDisabled) e.currentTarget.style.backgroundColor = '#FFA05A'
                        }}
                    >
                        <FontAwesomeIcon icon={audioIsPlaying ? faXmark : faPlay} />
                        {audioIsPlaying ? 'Stop' : 'Play Voice'}
                    </button>

                    <button
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                            saveCharBtnDisabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={saveCharBtnDisabled || isLoading}
                        onClick={handleAddNewCharacter}
                        style={{
                            backgroundColor: (saveCharBtnDisabled || isLoading) ? '#ccc' : '#FFA05A',
                            color: '#ffffff'
                        }}
                        onMouseEnter={(e) => {
                            if (!saveCharBtnDisabled && !isLoading) e.currentTarget.style.backgroundColor = '#FF8A3A'
                        }}
                        onMouseLeave={(e) => {
                            if (!saveCharBtnDisabled && !isLoading) e.currentTarget.style.backgroundColor = '#FFA05A'
                        }}
                    >
                        <FontAwesomeIcon icon={faCircleCheck} />
                        {isLoading ? 'Saving...' : 'Save Character'}
                    </button>
                </div>
            </div>
        </Modal>
    )

}

export default ModalCreateCharacter