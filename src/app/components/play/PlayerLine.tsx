import React from 'react'
import { Character, Line} from '@/app/types';
import { useVoicesStore } from '@/app/stores/useVoicesStores'

// TODO: How to deal with adding voice to this. Feels inefficient to import all voices and select voice by character voice_id and add to linebeingediteddata

type Props = {
  line: Line | null,
  characters: Character[] | null,
}

const SavedLine = ({line, characters}: Props) => {

  const currCharacter = characters?.find(char => char.id === line?.character_id)

  if (line == null) return

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
    <div className={`w-full text-center uppercase mb-10 rounded-xl pl-10 pr-10 py-3 cursor-pointer hover:bg-gray-100 transition-color duration-200 ease-in-out font-courier`}>
        <div className='text-lg'>{displaySelectedCharacterName()}</div>
        <div className='text-md'>{line.text}</div>
    </div>
  )
}

export default SavedLine