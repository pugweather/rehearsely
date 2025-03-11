import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock} from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

// TODO: convert modified unix timestamp to readable format

interface SceneCardProps {
    id: number;
    name: string;
    modified: string;
  }
  
const SceneCard = ({id, name, modified}: SceneCardProps) => {
  return (
    <div className='relative mt-6.5'>
      <div className="absolute z-2 -top-3 right-3 w-[85%] h-6 bg-blue-950 rounded-lg"></div>
      <div className="grid grid-cols-2 gap-4 relative z-10 text-blue-950 shadow-[0_0_3px_1px_rgba(0,0,0,0.1)] p-6 bg-white rounded-lg">
        <div className='flex flex-col'>
          <div className="font-bold mb-2.5">{name}</div>
          <div className='flex items-center'>
            <FontAwesomeIcon icon={faClock} className="mr-1.75 mb-0.5" />
            <span>1 day ago</span>
          </div>
        </div>
        <FontAwesomeIcon icon={faEllipsis} className='justify-self-end items-start self-center font-bold tracking-wider' />
      </div>
    </div>
  )
}

export default SceneCard