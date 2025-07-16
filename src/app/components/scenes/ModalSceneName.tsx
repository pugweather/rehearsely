import React, { useState } from 'react'
import Modal from '../ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import Input from '../ui/Input'
import ButtonLink from '../ui/ButtonLink'
import clsx from 'clsx'
import { Scene } from '@/app/types'

type Props =  {
  scene: Scene;
  closeEditNameModal: () => void;
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  setSceneEditing: (scene: Scene | null) => void;
}

const ModalSceneName = ({closeEditNameModal, setSceneEditing, setScenes, scene}: Props) => {

  const [sceneName, setSceneName] = useState<string | null>(scene.name)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const disabled = (sceneName === null || sceneName.trim() === '')

  const handleSubmit = async () => {

    setIsLoading(true)

    const res = await fetch("/api/private/scenes", {
      method: "PATCH",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: scene.id,
        name: sceneName
      })
    })

    if (res.ok) {

      setIsLoading(false)

      const data = await res.json()
      const updatedName = data?.updatedScene?.name

      setScenes(prev => {
        return prev.map(prevScene => {
          return scene.id === prevScene.id 
          ? {...prevScene, name: updatedName} : prevScene
        })
      })

      closeEditNameModal()
      setSceneEditing(null)
    } else {
      setIsLoading(false)
      console.log("Error: failed to update scene name")
    }
  }

  return (
    <Modal width={500} height={250}>
        <div className='flex flex-col pt-10 pl-5 pr-5 h-[90%]'>
          <div onClick={closeEditNameModal}>
            <FontAwesomeIcon icon={faClose} className="absolute top-5 right-5 text-3xl text-gray-800 cursor-pointer" />
          </div>
          <div className='text-2xl pl-2 mb-2.5 font-semibold'>Edit Name</div>
          <Input placeholder={'Enter scene name...'} value={sceneName || ''} onChange={setSceneName}/>
          <button 
            className={clsx(
              'ml-auto mt-auto',
              disabled && 'opacity-50 pointer-events-none',
            )}
            disabled={disabled}
            onClick={handleSubmit}
          >
            <ButtonLink 
              icon={faCircleCheck} 
              text={isLoading ?  'Saving Changes...' : 'Save'}
              bgColor={isLoading ? "#ccc" : undefined}
              className='px-3 py-1 text-lg'
            />
          </button>
        </div>
    </Modal>
  )
}

export default ModalSceneName