import React, {useState, useEffect, useRef} from 'react'
import { DraftLine, Character } from '@/app/types'
import PlayerLine from './PlayerLine'
import CountdownModal from './CountdownModal'
import MicTranscriber from './MicTranscriber'
import { isLineCloseEnough } from '@/app/utils/utils'
import { useCharacters } from '@/app/context/charactersContext';
import { useSceneDelay } from '@/app/context/countdownContext'
// import MicTranscriberSimple from './MicTranscriberSimple' // For testing only

type Props = {
  lineItems: DraftLine[] | null,
  sceneId: number,
  sceneIsPlaying: boolean
  setSceneIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

const PlayerLineList = ({lineItems, sceneId, sceneIsPlaying, setSceneIsPlaying}: Props) => {

    // const sortedLines = lineItems?.slice().sort((a, b) => {
    //   if (!a || !b || a.order == null || b.order == null) return 0;
    //   return a.order - b.order;
    // });

    // const [characters, setCharacters] = useState<Character[] | null>(null)
    const {characters, setCharacters} = useCharacters()
    const {countdown, setCountdown} = useSceneDelay();
    // Not sure how to set initial value of countdown since it's context so I'll create state and initialize to the value from context
    const [delayCountdown, setDelayCountdown] = useState<number | null>(countdown)
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1) // Unless playing from a certain line

    var audio = useRef<HTMLAudioElement | null>(null)
    const lastLineIndex = lineItems ? lineItems.length - 1 : -1 // -1 = invalid index. Easier than using null
    const currentLine = lineItems && (-1 != currentLineIndex) ? lineItems[currentLineIndex] : null
    const currentCharacter = currentLine && (-1 != currentLineIndex) ? characters?.find(char => char.id === currentLine.character_id) : null
    const sceneHasStarted = (-1 != currentLineIndex) && (null != currentCharacter)
    const [spokenText, setSpokenText] = useState<string | null>(null)

    // Playing scene
    useEffect(() => {

      if (!currentLine) {
        return
      }

      if (!currentCharacter) {
        console.error("Error: character is null")
        return
      }

      const isLastLine = lastLineIndex === currentLineIndex
  
      // Handle my character speaking
      if (currentCharacter.is_me) {
        if (isLineCloseEnough(currentLine.text, spokenText)) {
          if (isLastLine) {
            setSceneIsPlaying(false)
          } else {
            console.log(currentLineIndex)
            setCurrentLineIndex(prev => prev + 1)
          }
        }
        
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
            console.log(currentLineIndex)
            setCurrentLineIndex(prev => prev + 1)
          }
        }
      }
      
    }, [currentLineIndex, spokenText])

    // Countdown
    useEffect(() => {
      const countdownInterval = setInterval(function() {
        setDelayCountdown(prev => {
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
    }, [])

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
            lineItems?.map((line, idx) => {
              const isCurrentLine = line.id === currentLine?.id
              return <PlayerLine key={line.id} line={line} characters={characters} isCurrentLine={isCurrentLine} lineIndex={idx} currentLineIndex={currentLineIndex}/>
            })
          }
          {sceneIsPlaying && delayCountdown !== null && <CountdownModal countdown={delayCountdown} />}
          {sceneHasStarted && <MicTranscriber line={currentLine} listening={currentCharacter.is_me} setSpokenText={setSpokenText} onLineSpoken={() => console.log("go to next line....")}/>}
        </>
    )
}

export default PlayerLineList