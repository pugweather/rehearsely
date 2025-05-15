import React from 'react'
import { Character, DraftLine, LineBeingEditedData } from '@/app/types';
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import localFont from "next/font/local";

const courierPrimeRegular = localFont({
    src: "../../../../public/fonts/courierPrimeRegular.ttf",
})

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
  const currCharacter = characters?.find(char => char.id === line?.character_id)
  const voices = useVoicesStore((s) => s.voices)

  if (line == null) return

  const handleSetLineToEditMode = () => {
    setLineBeingEdited(line)
    // Get voice object to pass into the edit mode line
    const voice = voices?.find(voice => String(voice.voice_id) == String(currCharacter?.voice_id)) // TODO: For some reason when i remove the string conversion it says one I can't compared nums and strs????
    console.log(currCharacter)
    setLineBeingEditedData({
      character: currCharacter || null,
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
    <div
      className={`w-full text-center mb-10 rounded-xl pl-10 pr-10 py-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200 ease-in-out font-medium ${courierPrimeRegular.className}`}
      onClick={handleSetLineToEditMode}
    >
      {/* Character Name */}
      <div className="text-lg tracking-wider uppercase text-gray-700 mb-2 font-semibold">
        {displaySelectedCharacterName()}
      </div>
  
      {/* Line Text */}
      <div className="text-xl leading-relaxed text-black whitespace-pre-wrap">
        {line.text}
      </div>
    </div>
  );
  
}

export default SavedLine