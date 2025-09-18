import React, { useState, useRef } from 'react'
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

    if (isLoading) return
    
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
    <Modal width={560} height={280}>
        <div className='flex flex-col h-full rounded-2xl' style={{backgroundColor: '#E3D6C6', border: '1px solid rgba(32,32,32,0.1)'}}>
          <div className='relative px-6 py-5'>
            <div className='text-xl font-semibold' style={{color: '#202020'}}>Edit Scene Name</div>
            <button onClick={closeEditNameModal} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)', color: '#202020'}}>
              <FontAwesomeIcon icon={faClose} />
            </button>
          </div>

          <div className='flex flex-col gap-3 px-6'>
            <label className='text-sm font-medium' style={{color: '#202020'}}>Scene name</label>
            <Input placeholder={'Enter scene name...'} value={sceneName || ''} onChange={setSceneName}/>
          </div>

          <div className='mt-auto px-6 py-4 flex items-center justify-end gap-3'>
            <button onClick={closeEditNameModal}>
              <ButtonLink text={'Cancel'} textColor='#CC7A00' bgColor='#FFF4E6' className='px-4 py-2' />
            </button>
            <button 
              className={clsx(
                disabled && 'opacity-60 pointer-events-none',
              )}
              disabled={disabled}
              onClick={handleSubmit}
            >
              <ButtonLink 
                icon={faCircleCheck} 
                text={isLoading ?  'Saving...' : 'Save'}
                bgColor={'#FFA05A'}
                className='px-4 py-2'
              />
            </button>
          </div>
        </div>
    </Modal>
  )
}

export default ModalSceneName