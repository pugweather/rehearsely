import React, { useRef } from 'react'
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock} from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { timeAgo } from '@/app/utils/utils';
import localFont from 'next/font/local';
import Modal from '../ui/Modal';
import Dropdown from '../ui/Dropdown';

// TODO: limit character count to 50 chars

const marlonProBold = localFont({
  src: "../../../../public/fonts/marlonProBold.ttf",
})

const noyhSlimMedium = localFont({
  src: "../../../../public/fonts/noyhSlimMedium.ttf",
})

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
    <div className='relative mt-6.5 cursor-pointer transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg' onClick={handleCardClick}>
      <div className="z-5 relative text-black shadow-[0_0_3px_1px_rgba(0,0,0,0.08)] p-6 bg-[#fffdf7] rounded-lg min-h-[8.5rem]">
        <div className='flex items-center w-full justify-between mb-5'>
          <div className={`font-bold text-2xl ${marlonProBold.className}`}>{name}</div>
          <div ref={dropdownBtnRef} className='z-5 font-bold tracking-wider cursor-pointer text-xl' 
            onClick={(e) => {
              e.stopPropagation()
              openDropdown(id, dropdownBtnRef)
            }}>
            <FontAwesomeIcon icon={faEllipsis} className='z-5'/>
          </div>
        </div>
        <div className={`flex items-center text-black text-xl ${noyhSlimMedium.className}`}>
          <FontAwesomeIcon icon={faClock} className="mr-1.75 mb-0.5" />
          <span>{timeAgo(modified_at)}</span>
        </div>
      </div>
    </div>
  )
}

export default SceneCard