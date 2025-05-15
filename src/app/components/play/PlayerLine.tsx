import React from 'react'
import { Character, Line} from '@/app/types';
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import localFont from "next/font/local";

const courierPrimeRegular = localFont({
    src: "../../../../public/fonts/courierPrimeRegular.ttf",
})

// TODO: How to deal with adding voice to this. Feels inefficient to import all voices and select voice by character voice_id and add to linebeingediteddata

type Props = {
  line: Line | null,
  characters: Character[] | null,
}

const PlayerLine = ({line, characters}: Props) => {

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
    <div className={`w-full text-center mb-10 rounded-xl pl-10 pr-10 py-3 ${courierPrimeRegular.className}`}>
        <div className='text-lg tracking-wider uppercase text-gray-700 mb-2 font-semibold'>{displaySelectedCharacterName()}</div>
        <div className='text-xl leading-relaxed text-black whitespace-pre-wrap'>{line.text}</div>
    </div>
  )
}

export default PlayerLine