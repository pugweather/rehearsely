import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock} from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { timeAgo } from '@/app/utils/utils';
import localFont from 'next/font/local';
import Modal from '../ui/Modal';
import Dropdown from '../ui/Dropdown';
import { dropdown } from '@heroui/react';
import { DropdownData } from '@/app/types';

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
    dropdownData: DropdownData[];
    setOpenedDropdownId: React.Dispatch<React.SetStateAction<number | null>> // ID of scene
    openDropdown: (sceneId: number, ref: React.RefObject<HTMLDivElement | null>) => void;
    closeDropdown: () => void;
}
  
const SceneCard = ({id, name, modified_at, dropdownData, setOpenedDropdownId, openDropdown}: SceneCardProps) => {

  const router = useRouter()
  const dropdownBtnRef = useRef<HTMLDivElement | null>(null);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).closest(".dropdown")) return
    router.push(`/editor/${id}`)
  }

  // Set dropdownid so that we can use it to launch modals
  const handleDropdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setOpenedDropdownId(id)
  }

  return (
    <div
  className="group relative mt-6.5 cursor-pointer transition-transform duration-200 ease-in-out"
  onClick={handleCardClick}
>
  
  {/* offset layer */}
  <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-lg border-4 border-black bg-[#72a4f2] group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-200 ease-in-out"></div>

  {/* main card */}
  <div className="relative z-10 h-full p-6 bg-[#e9dfd2] rounded-lg min-h-[8.5rem] border-4 border-black">
    <div className="flex items-center w-full justify-between mb-5 h-15">
      <div
        className={`font-bold text-2xl ${marlonProBold.className} line-clamp-2`}
      >
        {name}
      </div>
        <div
          ref={dropdownBtnRef}
          className="dropdown dropdown-end"
          onClick={handleDropdownClick}
          // onClick={(e) => e.stopPropagation()}
          // onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost m-1"
          >
            <FontAwesomeIcon icon={faEllipsis} />
          </div>

          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow"
          >
            {
              dropdownData.map(item => {
                return <li onClick={item.onClick}><a className={item.className}>{item.label}</a></li>
              })
            }
          </ul>
        </div>
    </div>

    <div
      className={`flex items-center text-black text-xl ${noyhSlimMedium.className}`}
    >
      <FontAwesomeIcon icon={faClock} className="mr-1.75 mb-0.5" />
      <span>{timeAgo(modified_at)}</span>
    </div>
  </div>
</div>

  
  )
}

export default SceneCard