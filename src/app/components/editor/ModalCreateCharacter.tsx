import React, { useState } from 'react'
import Modal from '../ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import Input from '../ui/Input'
import ButtonLink from '../ui/ButtonLink'
import clsx from 'clsx'
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import { LineBeingEditedData, Voice } from '@/app/types'
import { Preahvihear } from 'next/font/google'

type Props =  {
  sceneId: number;
  lineBeingEditedData: LineBeingEditedData,
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>,
  closeModal: () => void;
}

const ModalCreateCharacter = ({closeModal, lineBeingEditedData, setLineBeingEditedData, sceneId}: Props) => {

  const [characterName, setCharacterName] = useState<string >("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const voices = useVoicesStore(s => s.voices)
  const voicesCategorized = useVoicesStore(s => s.voicesCategorized)
  
  const saveCharBtnDisabled = (characterName.trim() === '')
  const playVoiceBtnDisabled = (characterName.trim() === '')

    // overall: 
        // add in voice_id to character table. this is required bc all lines that aren't u need a voice
        // create new char for scene in db
    // smaller
        // track char name in state
        // track selected voice in state
        // Dropdown has select voice as top option, and list of voices in dropdown
        // Selecting voice will show that voice in the box
        // on submit, create a new character (post) in db for this line (requires: name, scene_id) - get from linebeingediteddata
        // retrieve newly created character and set that character as the currentcharacter in linebeingediteddata'

    const handleAddNewCharacter = async () => {

        setIsLoading(true)

        const res = await fetch("/api/private/voices", {
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

    const handleSetAsVoice = (voice: Voice) => {
        console.log(voice)
        // TODO: ADD VOICE KEY TO lineBeingEditedData
        //setLineBeingEditedData(prev => ...prev, voice: voice)
    }

    const getVoicesJSX = (gender: "male" | "female") =>{
        return voicesCategorized ?
        Object.entries(voicesCategorized).map(([category, voices]) => {
            return (
                <>
                    <div className='w-full'>{category}</div>
                    {voices[gender].map(voice => {
                        return <div className='px-3 py-3 mt-2 mr-3 mb-2 w-30 bg-gray-100 rounded-lg text-center cursor-pointer transition-all ease-in-out duration-200 hover:bg-green-100' onClick={() => handleSetAsVoice(voice)}>{voice.name}</div>
                    })}
                </>
            )
        }) : null
    }
    const maleCharBtns = getVoicesJSX("male")
    const femaleCharBtns = getVoicesJSX("female")

    return (
        <Modal width={900} height={750}>
            <div className='flex flex-col pt-10 pl-5 pr-5 h-[95%]'>
            <div onClick={closeModal}>
                <FontAwesomeIcon icon={faClose} className="absolute top-5 right-5 text-3xl text-gray-800 cursor-pointer" />
            </div>
            <div className='text-2xl pl-2 mb-2.5 font-semibold'>Character Name</div>
            <Input placeholder={'Enter character name...'} value={characterName || ''} onChange={setCharacterName}/> 
            <div className='text-2xl pl-2 mb-2.5 mt-5 font-semibold'>Select Voice</div>
            <div className='flex justify-between font-semibold ml-2 overflow-y-auto'>
                <div className='w-[50%] mr-2'>
                    <div className='mb-4 text-lg italic'>Male</div>
                    <div className='flex flex-wrap justify-start'>
                        {maleCharBtns}
                    </div>
                </div>
                <div className='w-[50%] ml-2'>
                    <div className='mb-4 text-lg italic'>Female</div>
                    <div className='flex flex-wrap justify-start'>
                        {femaleCharBtns}
                    </div>
                </div>
            </div>
            <div className='ml-auto mr-4 mt-auto'>
                <button 
                    className={clsx(
                        'ml-auto mt-auto',
                        playVoiceBtnDisabled && 'opacity-50 pointer-events-none',
                    )}
                    disabled={playVoiceBtnDisabled}
                    onClick={() => console.log("test")}
                >
                    <ButtonLink 
                        icon={faCircleCheck} 
                        text={isLoading ?  'Stop playing' : 'Play selected voice'}
                        bgColor={isLoading ? "#ccc" : undefined}
                    />
                </button>
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