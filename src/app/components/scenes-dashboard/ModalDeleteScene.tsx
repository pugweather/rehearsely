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

        closeDeleteSceneModal()
        setSceneDeleting(null)
    }
  }
  

  return (
    <Modal width={500} height={300}>
        <div className='flex flex-col h-[90%]'>
          <div onClick={closeDeleteSceneModal}>
            <FontAwesomeIcon icon={faClose} className="absolute top-5 right-5 text-3xl text-white cursor-pointer" />
          </div>
          <div className='text-2xl pl-5 pt-5 pb-5 mb-2.5 font-semibold text-white' style={{backgroundColor: "#ff7875"}}>Confirm Deletion</div>
          <div className='pl-5 pr-5'>
            <div className='text-xl pl-2 mt-7.5 mb-2.5 font-semibold text-center'>Are you sure you want to delete <span className="italic">{scene.name}</span>?</div>
            <div className='flex justify-center mt-12'>
                <button  onClick={closeDeleteSceneModal}>
                    <ButtonLink icon={faClose} textColor='#000' bgColor='#ebecee' text='Cancel'/>
                </button>
                <button className='ml-10' onClick={handleDelete}>
                    <ButtonLink icon={faTrashCan} textColor='#fff' bgColor='#ff7875' text='Delete'/>
                </button>
            </div>
          </div>
        </div>
    </Modal>
  )
}

export default ModalDeleteScene