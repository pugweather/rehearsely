import React, { useState } from 'react'
import Modal from '../ui/Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import Input from '../ui/Input'
import ButtonLink from '../ui/ButtonLink'

type Scene = {
  id: number;
  name: string | null;
  modified_at: string;
  user_id: string;
};

type Props =  {
  scene: Scene,
  closeEditNameModal: () => void;
}

const ModalSceneName = ({closeEditNameModal, scene}: Props) => {

  const [sceneName, setSceneName] = useState<string | null>(scene.name)

  console.log(sceneName)

  return (
    <Modal width={500} height={250}>
        <div className='flex flex-col pt-10 pl-5 pr-5 h-[90%]'>
          <div onClick={closeEditNameModal}>
            <FontAwesomeIcon icon={faClose} className="absolute top-5 right-5 text-3xl text-gray-800 cursor-pointer" />
          </div>
          <div className='text-2xl pl-2 mb-2.5 font-semibold'>Edit Name</div>
          <Input placeholder={'Enter scene name...'} value={sceneName || ''} onChange={setSceneName}/>
          <button className='ml-auto mt-auto'>
            <ButtonLink icon={faCircleCheck} text='Save'/>
          </button>
        </div>
    </Modal>
  )
}

export default ModalSceneName