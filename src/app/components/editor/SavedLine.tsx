import React from 'react'
import { Character, DraftLine, LineBeingEditedData } from '@/app/types';

type Props = {
  line: DraftLine | null,
  lines: DraftLine[] | null,
  characters: Character[] | null,
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>,
  setLineBeingEdited: React.Dispatch<React.SetStateAction<DraftLine | null>>,
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>;
}

const SavedLine = ({line, lines, characters, setLines, setLineBeingEdited, setLineBeingEditedData}: Props) => {
  console.log(lines)

  const TEMP_LINE_ID = -999
  const currCharacter = characters?.find(char => char.id === line?.id) || null

  if (line == null) return

  const handleSetLineToEditMode = () => {
    setLineBeingEdited(line)
    setLineBeingEditedData({
      character: currCharacter,
      text: line.text,
    })
    removeTempLine()
  }

  const removeTempLine = () => {
    let tempLineExists = lines?.find(line => line.id == (TEMP_LINE_ID))
    if (tempLineExists) {
      setLines(prev => prev ? prev.filter(line => line.id !== TEMP_LINE_ID) : null)
    }
  }

  return (
    <div className={`text-center uppercase mb-10 rounded-xl py-3 pl-3 pr-8 cursor-pointer hover:bg-gray-100 transition-color duration-200 ease-in-out font-courier`} onClick={handleSetLineToEditMode}>
        <div className='text-lg'>{currCharacter?.name}</div>
        <div className='text-md'>{line.text}</div>
    </div>
  )
}

export default SavedLine