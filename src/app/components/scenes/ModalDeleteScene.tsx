import React, { useState } from 'react'
import Modal from '../ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faTriangleExclamation, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import Input from '../ui/Input'
import ButtonLink from '../ui/ButtonLink'
import clsx from 'clsx'
import { Scene } from '@/app/types'

type Props =  {
  scene: Scene;
  closeDeleteSceneModal: () => void;
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  setSceneDeleting: (scene: Scene | null) => void;
}

const ModalDeleteScene = ({closeDeleteSceneModal, setSceneDeleting, setScenes, scene}: Props) => {

  console.log(scene.id)
  const [isOpen, setIsOpen] = useState<boolean>(true)

  const handleClose = () => {
    setIsOpen(false)
    // Wait for animation to complete before calling parent close function
    setTimeout(() => {
      closeDeleteSceneModal()
      setSceneDeleting(null)
    }, 200)
  }

  const handleDelete = async () => {
    const res = await fetch("/api/private/scenes", {
      method: "DELETE",
      headers:{
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: scene.id,
      })
    })

    if (res.ok) {

        setScenes(prev => {
            return prev.filter(prevScene => {
                return scene.id !== prevScene.id
            })
        })

        handleClose()
    }
  }
  

  return (
    <Modal width={560} height={260} isOpen={isOpen} onClose={handleClose}>
        <div className='flex flex-col h-full rounded-2xl' style={{backgroundColor: '#E3D6C6', border: '1px solid rgba(32,32,32,0.1)'}}>
          <div className='relative px-6 py-5'>
            <div className='text-xl font-semibold' style={{color: '#202020'}}>Confirm Deletion</div>
            <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)', color: '#202020'}}>
              <FontAwesomeIcon icon={faClose} />
            </button>
          </div>

          {/* Body */}
          <div className='px-6 py-4 flex items-start gap-3'>
            <FontAwesomeIcon icon={faTriangleExclamation} className='text-xl' style={{color: '#CC7A00'}} />
            <div className='text-base' style={{color: '#202020'}}>
              Are you sure you want to delete <span className="font-semibold">{scene.name}</span>? This action cannot be undone.
            </div>
          </div>

          {/* Footer */}
          <div className='mt-auto px-6 py-4 flex items-center justify-end gap-3'>
            <button onClick={handleClose}>
              <ButtonLink text={'Cancel'} textColor='#CC7A00' bgColor='#FFF4E6' className='px-4 py-2' />
            </button>
            <button onClick={handleDelete}>
              <ButtonLink icon={faTrashCan} text={'Delete'} bgColor={'#FFA05A'} className='px-4 py-2' />
            </button>
          </div>
        </div>
    </Modal>
  )
}

export default ModalDeleteScene