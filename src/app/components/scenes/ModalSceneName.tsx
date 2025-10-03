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
  const [isOpen, setIsOpen] = useState<boolean>(true)

  const disabled = (sceneName === null || sceneName.trim() === '')

  const handleClose = () => {
    setIsOpen(false)
    // Wait for animation to complete before calling parent close function
    setTimeout(() => {
      closeEditNameModal()
      setSceneEditing(null)
    }, 200)
  }

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

      handleClose()
    } else {
      setIsLoading(false)
      console.log("Error: failed to update scene name")
    }
  }

  return (
    <Modal width={560} height={280} isOpen={isOpen} onClose={handleClose}>
        <div className='flex flex-col h-full rounded-2xl bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] border-4 border-black shadow-xl'>
          <div className='relative px-6 py-5'>
            <div className='text-2xl font-bold text-gray-800'>Edit Scene Name</div>
            <button 
              onClick={handleClose} 
              className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200"
            >
              <FontAwesomeIcon icon={faClose} className="text-gray-700" />
            </button>
          </div>

          <div className='flex flex-col gap-4 px-6'>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter scene name..."
                value={sceneName || ''}
                onChange={(e) => setSceneName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-3 border-black bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#72a4f2] focus:border-[#72a4f2] transition-all duration-200"
              />
            </div>
          </div>

          <div className='mt-auto px-6 py-4 flex items-center justify-end gap-3'>
            <button 
              onClick={handleClose}
              className="px-6 py-3 bg-white rounded-xl border-3 border-black font-bold text-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              Cancel
            </button>
            <button 
              className={clsx(
                "px-6 py-3 bg-gradient-to-br from-[#ffa05a] to-[#ff8a3a] rounded-xl border-3 border-black font-bold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                disabled && 'opacity-60 pointer-events-none cursor-not-allowed',
              )}
              disabled={disabled}
              onClick={handleSubmit}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
    </Modal>
  )
}

export default ModalSceneName