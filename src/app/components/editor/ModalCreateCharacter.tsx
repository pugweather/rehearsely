import React, { useState } from 'react'
import Modal from '../ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import Input from '../ui/Input'
import ButtonLink from '../ui/ButtonLink'
import clsx from 'clsx'
import { useVoicesStore } from '@/app/stores/useVoicesStores'

type Props =  {
  sceneId: number;
  closeModal: () => void;
}

const ModalCreateCharacter = ({closeModal, sceneId}: Props) => {

  const [characterName, setCharacterName] = useState<string >("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const voices = useVoicesStore(s => s.voices)
  
  const disabled = (characterName.trim() === '')

  console.log(characterName)

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

    return (
        <Modal width={750} height={375}>
            <div className='flex flex-col pt-10 pl-5 pr-5 h-[90%]'>
            <div onClick={closeModal}>
                <FontAwesomeIcon icon={faClose} className="absolute top-5 right-5 text-3xl text-gray-800 cursor-pointer" />
            </div>
            <div className='text-2xl pl-2 mb-2.5 font-semibold'>Character Name</div>
            <Input placeholder={'Enter character name...'} value={characterName || ''} onChange={setCharacterName}/>
            <div className='text-2xl pl-2 mb-2.5 mt-5 font-semibold'>Select Voice</div>
            <div>
                {voices?.map(voice => {
                    return <div></div>
                    // TODO: CREATE THESE AI CHARACTER BUTTON COMPONENTS AND PUT HERE
                })}
            </div>
            <button 
                className={clsx(
                'ml-auto mt-auto',
                disabled && 'opacity-50 pointer-events-none',
                )}
                disabled={disabled}
                onClick={handleAddNewCharacter}
            >
                <ButtonLink 
                icon={faCircleCheck} 
                text={isLoading ?  'Saving Changes...' : 'Save'}
                bgColor={isLoading ? "#ccc" : undefined}
                />
            </button>
            </div>
        </Modal>
    )
}

export default ModalCreateCharacter