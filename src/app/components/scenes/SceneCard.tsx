import React, { useRef, useState } from 'react'
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

  // New solution. Set global opened id. if it's null then nothing is opened so continue otherwise if there is an opened dropdown id return
  const [openedDropdownId, setOpenedDropdownId] = useState<number | null>(null)

  const handleCardClick = () => {
    router.push(`/editor/${id}`)
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
        className="dropdown dropdown-end"
      >
        <div
          tabIndex={0}
          role="button"
          className="btn m-1"
        >
          Click
        </div>

        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow"
        >
          <li><a>Item 1</a></li>
          <li><a>Item 2</a></li>
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