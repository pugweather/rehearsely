import React from 'react'
import { Character, DraftLine, LineBeingEditedData } from '@/app/types';
import { useVoicesStore } from '@/app/stores/useVoicesStores'

// TODO: How to deal with adding voice to this. Feels inefficient to import all voices and select voice by character voice_id and add to linebeingediteddata

type Props = {
  line: DraftLine | null,
  lines: DraftLine[] | null,
  characters: Character[] | null,
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>,
  setLineBeingEdited: React.Dispatch<React.SetStateAction<DraftLine | null>>,
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>;
}

const SavedLine = ({line, lines, characters, setLines, setLineBeingEdited, setLineBeingEditedData}: Props) => {

  const TEMP_LINE_ID = -999
  const currCharacter = characters?.find(char => char.id === line?.character_id) || null
  const voices = useVoicesStore((s) => s.voices)

  if (line == null) return

  const handleSetLineToEditMode = () => {
    setLineBeingEdited(line)
    // Get voice object to pass into the edit mode line
    const voice = voices?.find(voice => Number(voice.voice_id) == Number(currCharacter?.voice_id))
    setLineBeingEditedData({
      character: currCharacter,
      text: line.text,
      order: line.order,
      voice: voice || null
    })
    removeTempLine()
  }

  const removeTempLine = () => {
    let tempLineExists = lines?.find(line => line.id == (TEMP_LINE_ID))
    if (tempLineExists) {
      setLines(prev => prev ? prev.filter(line => line.id !== TEMP_LINE_ID) : null)
    }
  }

  const displaySelectedCharacterName = () => {

    let res = ""

    const meText = "(me)"
    const charIsMe = currCharacter?.is_me === true

    if (currCharacter) {
        res += currCharacter.name
    } if (charIsMe) {
        res += ' ' + meText
    }

    return res
  }

  return (
    <div className={`w-full text-center uppercase mb-10 rounded-xl pl-10 pr-10 py-3 cursor-pointer hover:bg-gray-100 transition-color duration-200 ease-in-out font-courier`} onClick={handleSetLineToEditMode}>
        <div className='text-lg'>{displaySelectedCharacterName()}</div>
        <div className='text-md'>{line.text}</div>
    </div>
  )
}

export default SavedLine