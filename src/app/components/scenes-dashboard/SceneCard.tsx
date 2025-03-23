import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock} from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { timeAgo } from '@/app/utils/utils';

// TODO: convert modified unix timestamp to readable format
// TODO: limit character count to 50 chars

interface SceneCardProps {
    id: number;
    name: string | null;
    modified_at: string;
    user_id: string
}
  
const SceneCard = ({id, name, modified_at}: SceneCardProps) => {
  return (
    <div className='relative mt-6.5'>
      <div className="absolute z-2 -top-3 right-3 w-[85%] h-6 bg-blue-950 rounded-lg"></div>
      <div className="grid grid-cols-[4fr_1fr] gap-4 relative z-10 text-blue-950 shadow-[0_0_3px_1px_rgba(0,0,0,0.1)] p-6 bg-white rounded-lg h-[8.5rem]">
        <div className='flex flex-col font-[var(--font-yeseva)]'>
          <div className="font-bold mb-2.5">{name}</div>
          <div className='flex items-center'>
            <FontAwesomeIcon icon={faClock} className="mr-1.75 mb-0.5" />
            <span>{timeAgo(modified_at)}</span>
          </div>
        </div>
        <FontAwesomeIcon icon={faEllipsis} className='justify-self-end items-start self-center font-bold tracking-wider cursor-pointer' />
      </div>
    </div>
  )
}

export default SceneCard