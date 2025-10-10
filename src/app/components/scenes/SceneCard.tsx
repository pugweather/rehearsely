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
  const [isClicking, setIsClicking] = useState(false);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).closest(".dropdown")) return
    setIsClicking(true)
    setTimeout(() => {
      router.push(`/editor/${id}`)
    }, 150)
  }
  // Set dropdownid so that we can use it to launch modals
  const handleDropdownClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setOpenedDropdownId(id)
  }

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 ${
        isClicking ? 'scale-95 -rotate-1' : ''
      }`}
      onClick={handleCardClick}
    >

      {/* Enhanced offset layer with playful shadow */}
      <div className={`absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-4 border-black bg-gradient-to-br from-[#72a4f2] to-[#5a8de8] group-hover:translate-x-4 group-hover:translate-y-4 transition-all duration-300 ease-out ${
        isClicking ? 'translate-x-1 translate-y-1' : ''
      }`}></div>

      {/* main card with enhanced styling */}
      <div className={`relative z-10 h-full p-8 bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl min-h-[10rem] border-4 border-black group-hover:shadow-2xl transition-all duration-150 ease-out ${
        isClicking ? 'shadow-sm' : ''
      }`}>
        
        {/* Subtle highlight on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-3">
              <h3
                className={`font-bold text-2xl leading-tight ${marlonProBold.className} group-hover:text-[#2c5aa0] transition-colors duration-300 line-clamp-2`}
              >
                {name}
              </h3>
            </div>
            <div
              ref={dropdownBtnRef}
              className="dropdown dropdown-end flex-shrink-0"
              onClick={handleDropdownClick}
            >
              <div
                tabIndex={0}
                role="button"
                className="w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-black transition-all duration-300 flex items-center justify-center group/btn"
              >
                <FontAwesomeIcon
                  icon={faEllipsis}
                  className="text-black group-hover/btn:text-white transition-all duration-300 text-sm"
                />
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white rounded-xl z-50 w-52 p-2 shadow-xl border border-black overflow-hidden mt-2"
              >
                {
                  dropdownData.map((item, index) => {
                    return (
                      <li key={index}>
                        <a 
                          className={`${item.className} hover:bg-[#72a4f2]/10 rounded-lg transition-all duration-200 px-3 py-2`} 
                          onClick={(e) => {
                            e.preventDefault();
                            item.onClick();
                            // Close dropdown immediately like character selection
                            const activeElement = document.activeElement as HTMLElement;
                            if (activeElement) {
                              activeElement.blur();
                            }
                          }}
                        >
                          {item.label}
                        </a>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div
                className={`text-black text-lg font-medium ${noyhSlimMedium.className} tracking-wide`}
              >
                {timeAgo(modified_at)}
              </div>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-[#72a4f2] rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-3 h-3 bg-[#ffa05a] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="w-3 h-3 bg-[#FFD96E] rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  
  )
}

export default SceneCard