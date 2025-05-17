import React, {useState, useEffect, useRef} from 'react'
import { Line, Character } from '@/app/types'
import PlayerLine from './PlayerLine'
import CountdownModal from './CountdownModal'

type Props = {
  lineItems: Line[] | null,
  sceneId: number,
  sceneIsPlaying: boolean
  setSceneIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

const PlayerLineList = ({lineItems, sceneId, sceneIsPlaying, setSceneIsPlaying}: Props) => {

    const sortedLines = lineItems?.slice().sort((a, b) => {
      if (!a || !b || a.order == null || b.order == null) return 0;
      return a.order - b.order;
    });

    const [characters, setCharacters] = useState<Character[] | null>(null)
    const [countdown, setCountdown] = useState<number | null>(3); // Make custom
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1) // Unless playing from a certain line

    var audio = useRef<HTMLAudioElement | null>(null)
    const lastLineIndex = sortedLines ? sortedLines.length - 1 : -1 // -1 = invalid index. Easier than using null
    const currentLine = sortedLines ? sortedLines[currentLineIndex] : null
    console.log(currentLineIndex)

    // Playing scene
    useEffect(() => {

      if (!currentLine) {
        return
      }

      const character = characters?.find(char => char.id === currentLine.character_id)
      if (!character) {
        console.error("Error: character is null")
        return
      }

      const isLastLine = lastLineIndex === currentLineIndex

      // Handle my character speaking
      if (character.is_me) {
        
      // Handle other characters speaking
      } else {
        
        const characterAudioUrl = currentLine.audio_url
        const currAudio = new Audio(characterAudioUrl)
        audio.current = currAudio
        audio.current.play()

        // Quit player after last line is finished
        audio.current.onended = () => {
          if (isLastLine) {
            setSceneIsPlaying(false)
          } else {
            setCurrentLineIndex(prev => prev + 1)
          }
        }
      }
      
    }, [currentLineIndex])

    // Countdown
    useEffect(() => {
      const countdownInterval = setInterval(function() {
        setCountdown(prev => {
          if (prev === null || prev === 1) { // Technically end countdown on 1 lol
            const firstLineIndex = 0
            setCurrentLineIndex(firstLineIndex)
            clearInterval(countdownInterval)
            return null
          }
          return prev - 1 
        })
      }, 1000)
      return () => clearInterval(countdownInterval);
    }, [sceneIsPlaying])

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
              return <PlayerLine key={line.id} line={line} characters={characters}/>
            })
          }
          {sceneIsPlaying && countdown !== null && <CountdownModal countdown={countdown} />}
        </>
    )
}

export default PlayerLineList