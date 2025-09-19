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
      className="group relative cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1"
      onClick={handleCardClick}
    >
      
      {/* Enhanced offset layer with subtle gradient */}
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-lg border-4 border-black bg-gradient-to-br from-[#72a4f2] to-[#5a8de8] group-hover:translate-x-3 group-hover:translate-y-3 transition-all duration-300 ease-out"></div>

      {/* main card with improved styling */}
      <div className="relative z-10 h-full p-6 bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-lg min-h-[8.5rem] border-4 border-black group-hover:shadow-lg transition-all duration-300 ease-out">
        
        {/* Subtle highlight on hover */}
        <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
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
                className="btn btn-ghost btn-sm hover:bg-[#72a4f2]/15 transition-all duration-200 rounded-lg"
              >
                <FontAwesomeIcon 
                  icon={faEllipsis} 
                  className="transition-transform duration-200 hover:scale-110 text-sm" 
                />
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white/95 backdrop-blur-sm rounded-xl z-50 w-52 p-3 shadow-xl border-2 border-black/5"
              >
                {
                  dropdownData.map((item, index) => {
                    return (
                      <li key={index}>
                        <a 
                          className={`${item.className} hover:bg-[#72a4f2]/10 rounded-lg transition-all duration-200`} 
                          onClick={(e) => {
                            item.onClick();
                            // Close dropdown by removing focus from all elements
                            const activeElement = document.activeElement as HTMLElement;
                            if (activeElement) {
                              activeElement.blur();
                            }
                            // Force close by clicking outside
                            setTimeout(() => {
                              document.body.click();
                            }, 10);
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
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-[#72a4f2] rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-2 h-2 bg-[#ffa05a] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="w-2 h-2 bg-[#FFD96E] rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  
  )
}

export default SceneCard