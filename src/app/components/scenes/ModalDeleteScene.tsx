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
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const handleClose = () => {
    setIsOpen(false)
    // Wait for animation to complete before calling parent close function
    setTimeout(() => {
      closeDeleteSceneModal()
      setSceneDeleting(null)
    }, 200)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
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
    } else {
      setIsDeleting(false)
    }
  }
  

  return (
    <Modal width={560} height={260} isOpen={isOpen} onClose={handleClose}>
        <div className='flex flex-col h-full rounded-2xl bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] border-4 border-black shadow-xl'>
          <div className='relative px-6 py-5'>
            <div className='text-2xl font-bold text-gray-800'>Confirm Deletion</div>
            <button 
              onClick={handleClose} 
              className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200"
            >
              <FontAwesomeIcon icon={faClose} className="text-gray-700" />
            </button>
          </div>

          {/* Body */}
          <div className='px-6 py-4 flex items-start gap-4'>
            <div className="w-12 h-12 rounded-full border-3 border-black bg-red-50 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faTriangleExclamation} className='text-xl text-red-600' />
            </div>
            <div className='text-lg text-gray-800 leading-relaxed'>
              Are you sure you want to delete <span className="font-bold text-red-600">{scene.name}</span>? This action cannot be undone.
            </div>
          </div>

          {/* Footer */}
          <div className='mt-auto px-6 py-4 flex items-center justify-end gap-3'>
            <button 
              onClick={handleClose}
              className="px-6 py-3 bg-white rounded-xl border-3 border-black font-bold text-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl border-3 border-black font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2 ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrashCan} />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
    </Modal>
  )
}

export default ModalDeleteScene