import React, { useState, useRef } from 'react'
import Modal from '../ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faCircleCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import Input from '../ui/Input'
import ButtonLink from '../ui/ButtonLink'
import clsx from 'clsx'
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import { LineBeingEditedData, Voice } from '@/app/types'
import { Preahvihear } from 'next/font/google'
import { ElevenLabsClient, play } from "elevenlabs";
import "dotenv/config";

type Props =  {
  sceneId: number;
  lineBeingEditedData: LineBeingEditedData,
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>,
  closeModal: () => void;
}

const ModalCreateCharacter = ({closeModal, lineBeingEditedData, setLineBeingEditedData, sceneId}: Props) => {

    const [characterName, setCharacterName] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [audioIsPlaying, setAudioIsPlaying] = useState<boolean>(false)

    const voices = useVoicesStore(s => s.voices)
    const voicesCategorized = useVoicesStore(s => s.voicesCategorized)
    
    const selectedVoiceId = lineBeingEditedData.voice?.voice_id
    const saveCharBtnDisabled = (characterName.trim() === '')
    const playVoiceBtnDisabled = selectedVoiceId == null

    const currentAudio = useRef<HTMLAudioElement | null>(null)

    const playSelectedVoiceAudio = async () => {
        if (!selectedVoiceId) return

        if (currentAudio.current) {
            currentAudio.current.pause()
            currentAudio.current.currentTime = 0
            currentAudio.current = null
        }
        currentAudio.current = new Audio(`/api/private/voices/voice_samples/${selectedVoiceId}`)
        currentAudio.current.play()
        currentAudio.current.onended = () => {
            setAudioIsPlaying(false)
        }
        setAudioIsPlaying(true)
    };

    const stopSelectedVoiceAudio = async () => {
        if (currentAudio.current) {
            currentAudio.current.pause();
            currentAudio.current.currentTime = 0;
            currentAudio.current = null
            setAudioIsPlaying(false)
        } else {
            throw new Error("Global audio object doesn't exist?! :(")
        }
    };

    const handleAddNewCharacter = async () => {

        setIsLoading(true)

        const res = await fetch("/api/private/voices/voice_chars", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: characterName,
                sceneId: sceneId
            })
        })

        if (res.ok) {

        setIsLoading(false)

        // const data = await res.json()
        // const updatedName = data?.updatedScene?.name

        // setScenes(prev => {
        //     return prev.map(prevScene => {
        //     return scene.id === prevScene.id 
        //     ? {...prevScene, name: updatedName} : prevScene
        //     })
        // })

        closeModal()
        } else {
        setIsLoading(false)
        console.log("Error: ")
        }
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
                    <div className='w-full'>{category}</div>
                    {voices[gender].map(voice => {
                        return  (
                            <div 
                                className={clsx(
                                    'px-3 py-3 mt-2 mr-3 mb-2 w-30 bg-gray-100 rounded-lg text-center cursor-pointer transition-all ease-in-out duration-200 hover:bg-green-100',
                                    voice.voice_id === selectedVoiceId && "bg-green-100",

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
        <Modal width={900} height={750}>
            <div className='flex flex-col pt-10 pl-5 pr-5 h-[95%]'>
            <div onClick={closeModal}>
                <FontAwesomeIcon icon={faClose} className="absolute top-5 right-5 text-3xl text-gray-800 cursor-pointer" />
            </div>
            <div className='text-2xl pl-2 mb-5 font-semibold'>Character Name</div>
            <Input placeholder={'Enter character name...'} value={characterName || ''} onChange={setCharacterName}/> 
            <div className='text-2xl pl-2 mb-5 mt-5 font-semibold'>Select Voice</div>
            <div className='flex justify-between font-semibold ml-2 overflow-y-auto'>
                <div className='w-[50%] mr-2'>
                    <div className='mb-4 text-lg'>Male</div>
                    <div className='flex flex-wrap justify-start'>
                        {maleCharBtns}
                    </div>
                </div>
                <div className='w-[50%] ml-2'>
                    <div className='mb-4 text-lg'>Female</div>
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
                        icon={audioIsPlaying ? faXmark : faCircleCheck} 
                        text={audioIsPlaying ?  'Stop playing' : 'Play selected voice'}
                        bgColor={isLoading ? "#ccc" : undefined}
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
                    />
                </button>
            </div>
            </div>
        </Modal>
    )
}

export default ModalCreateCharacter