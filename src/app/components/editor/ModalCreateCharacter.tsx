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

type Props =  {
  sceneId: number;
  lineBeingEditedData: LineBeingEditedData,
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>
  setCharacters: React.Dispatch<React.SetStateAction<Character[]| null>>
  setIsCreateCharModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  originalCharForOpenedLine: Character | null
}

const ModalCreateCharacter = ({setIsCreateCharModalOpen, setLineBeingEditedData, setCharacters, originalCharForOpenedLine, lineBeingEditedData, sceneId}: Props) => {

    const [characterName, setCharacterName] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [audioIsPlaying, setAudioIsPlaying] = useState<boolean>(false)

    const voices = useVoicesStore(s => s.voices)
    const voicesCategorized = useVoicesStore(s => s.voicesCategorized)
    
    const selectedVoiceId = lineBeingEditedData.voice?.voice_id
    const saveCharBtnDisabled = (characterName.trim() === '')
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

    const handleAddNewCharacter = async () => {

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
        setLineBeingEditedData(prev => {
            return {
                ...prev,
                voice: voice
            }
        })
    }

    const getVoicesJSX = (gender: "male" | "female") =>{
        if (voicesCategorized === null) return null
        return Object.entries(voicesCategorized).map(([category, voices]) => {
            return (
                <>
                    <div className='w-full text-lg'>{category}</div>
                    {voices[gender].map(voice => {
                        return  (
                            <div 
                                className={clsx(
                                    'px-3 py-2.5 mt-2 mr-3 mb-2 w-25 bg-[#fff4d8] rounded-xl text-lg text-center cursor-pointer transition-all ease-in-out duration-200 hover:bg-green-100',
                                    // voice.voice_id === selectedVoiceId && "bg-green-100", // Hmm, yeah we shouldn't ever be pre-selecting a voice since this modal is only for new characters
                                )}
                                onClick={() => handleSelectVoice(voice)}
                            >
                                {voice.name}
                            </div>
                        )
                    })}
                </>
            )
        })
    }
    const maleCharBtns = getVoicesJSX("male")
    const femaleCharBtns = getVoicesJSX("female")

    return (
        <Modal width={800} height={750}>
            <div className='flex flex-col pt-10 pl-5 pr-5 h-[95%]'>
            <div onClick={closeCreateCharModal}>
                <FontAwesomeIcon icon={faClose} className="absolute top-5 right-5 text-3xl text-gray-800 cursor-pointer" />
            </div>
            <div className='text-2xl pl-2 mb-5 font-semibold'>Character Name</div>
            <Input placeholder={'Enter character name...'} value={characterName || ''} onChange={setCharacterName}/> 
            <div className='text-2xl pl-2 mb-5 mt-5 font-semibold'>Select Voice</div>
            <div className='flex justify-between font-semibold ml-2 overflow-y-auto'>
                <div className='w-[50%] mr-2'>
                    <div className='mb-4 text-xl' style={{color: "#f47c2c"}}>MALE</div>
                    <div className='flex flex-wrap justify-start'>
                        {maleCharBtns}
                    </div>
                </div>
                <div className='w-[50%] ml-2'>
                    <div className='mb-4 text-xl' style={{color: "#f7a954"}}>FEMALE</div>
                    <div className='flex flex-wrap justify-start'>
                        {femaleCharBtns}
                    </div>
                </div>
            </div>
            <div className='ml-auto mr-4 mt-auto'>
                {/* Playing / Stopping voices */}
                <button 
                    className={clsx(
                        'ml-auto mt-auto',
                        playVoiceBtnDisabled && 'opacity-50 pointer-events-none',
                    )}
                    disabled={playVoiceBtnDisabled}
                    onClick={audioIsPlaying ? stopSelectedVoiceAudio : playSelectedVoiceAudio}
                >
                    <ButtonLink 
                        icon={audioIsPlaying ? faXmark : faPlay} 
                        text={audioIsPlaying ?  'Stop playing' : 'Play selected voice'}
                        bgColor="#f47c2c"
                        className='px-3 py-1 text-lg'
                    />
                </button>
                {/* Saving character */}
                <button 
                    className={clsx(
                        'ml-5 mt-auto',
                        saveCharBtnDisabled && 'opacity-50 pointer-events-none',
                    )}
                    disabled={saveCharBtnDisabled}
                    onClick={handleAddNewCharacter}
                >   
                    <ButtonLink 
                        icon={faCircleCheck} 
                        text={isLoading ?  'Saving Character...' : 'Save Character'}
                        bgColor={isLoading ? "#ccc" : undefined}
                        className='px-3 py-1 text-lg'
                    />
                </button>
            </div>
            </div>
        </Modal>
    )
}

export default ModalCreateCharacter