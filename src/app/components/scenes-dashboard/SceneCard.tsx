import React, { useRef } from 'react'
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock} from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { timeAgo } from '@/app/utils/utils';
import Modal from '../ui/Modal';
import Dropdown from '../ui/Dropdown';

// TODO: limit character count to 50 chars

interface SceneCardProps {
    id: number;
    name: string | null;
    modified_at: string;
    user_id: string;
    openDropdown: (sceneId: number, ref: React.RefObject<HTMLDivElement | null>) => void;
    closeDropdown: () => void;
}
  
const SceneCard = ({id, name, modified_at, openDropdown}: SceneCardProps) => {

  const router = useRouter()
  const dropdownBtnRef = useRef<HTMLDivElement | null>(null);

  const handleCardClick = () => {
    router.push(`/editor/${id}`)
  }

  return (
    <div className='relative mt-6.5 cursor-pointer' onClick={handleCardClick}>
      <div className="absolute z-2 -top-3 right-3 w-[85%] h-6 bg-black rounded-lg"></div>
      <div className="grid grid-cols-[4fr_1fr] gap-4 z-5 relative text-black shadow-[0_0_3px_1px_rgba(0,0,0,0.1)] p-6 bg-white rounded-lg h-[8.5rem]">
        <div className='flex flex-col font-[var(--font-yeseva)]'>
          <div className="font-bold mb-2.5">{name}</div>
          <div className='flex items-center'>
            <FontAwesomeIcon icon={faClock} className="mr-1.75 mb-0.5" />
            <span>{timeAgo(modified_at)}</span>
          </div>
        </div>
      </div>
      <div ref={dropdownBtnRef} className='absolute top-[35%] transform -translate-y-[-50%] right-7.5 z-5 justify-self-end items-start self-center font-bold tracking-wider cursor-pointer' 
        onClick={(e) => {
          e.stopPropagation()
          openDropdown(id, dropdownBtnRef)
          }}>
        <FontAwesomeIcon icon={faEllipsis} className='z-5'/>
      </div>
    </div>
  )
}

export default SceneCard