import React, {useState, useEffect} from 'react'
import { Line, Character } from '@/app/types'
import PlayerLine from './PlayerLine'

type Props = {
  lineItems: Line[] | null,
  sceneId: number
}

const PlayerLineList = ({lineItems, sceneId}: Props) => {

  const sortedLines = lineItems?.slice().sort((a, b) => {
    if (!a || !b || a.order == null || b.order == null) return 0;
    return a.order - b.order;
  });

  const [characters, setCharacters] = useState<Character[] | null>(null)

  console.log(characters)

  // Fetching characters
    useEffect(() => {
      const fetchSceneCharacters = async () => {
        try {
          const res = await fetch(`/api/private/scenes/${sceneId}/characters`)
          const charactersJson = await res.json()
          setCharacters(charactersJson)
        } catch (err) {
          console.error("Failed to catch characters for scene", err)
        }
      }
      fetchSceneCharacters()
    }, [sceneId])

    return (
        <>
            {
              sortedLines?.map(line => {
                return <PlayerLine line={line} characters={characters}/>
              })
            }
        </>
    )
}

export default PlayerLineList