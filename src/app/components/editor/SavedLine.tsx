import React from 'react'
import { DraftLine } from '@/app/types';

type Props = {
  line: DraftLine | null
  setLineBeingEdited: React.Dispatch<React.SetStateAction<DraftLine | null>>;
}

const SavedLine = ({line, setLineBeingEdited}: Props) => {

  if (line == null) return

  const handleSetLineToEditMode = () => {
    setLineBeingEdited(line)
  }

  return (
    <div className={`text-center uppercase mb-10 rounded-xl py-3 pl-3 pr-8 cursor-pointer hover:bg-gray-100 transition-color duration-200 ease-in-out font-courier`} onClick={handleSetLineToEditMode}>
        <div className='text-lg'>Jessica (you)</div>
        <div className='text-md'>{line.text}</div>
    </div>
  )
}

export default SavedLine