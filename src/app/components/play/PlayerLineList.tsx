import React, {useState, useEffect, useRef, useCallback} from 'react'
import { DraftLine, Character } from '@/app/types'
import PlayerLine from './PlayerLine'
import CountdownModal from './CountdownModal'
import MicTranscriber from './MicTranscriber'
import LinePositionTracker from './LineCompletionDetector'
import { isLineCloseEnough } from '@/app/utils/utils'
import { useCharacters } from '@/app/context/charactersContext';
import { useSceneDelay } from '@/app/context/countdownContext'
import { useTeleprompter } from '@/app/context/teleprompterContext'
// import MicTranscriberSimple from './MicTranscriberSimple' // For testing only

type Props = {
  lineItems: DraftLine[] | null,
  sceneId: number,
  sceneIsPlaying: boolean
  setSceneIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  onTeleprompterUpdate?: React.Dispatch<React.SetStateAction<{
    currentLine: DraftLine | null
    currentCharacter: Character | null
    matchedWordIndices: number[]
    delayCountdown: number | null
  }>>
}

const PlayerLineList = ({lineItems, sceneId, sceneIsPlaying, setSceneIsPlaying, onTeleprompterUpdate}: Props) => {

    // const sortedLines = lineItems?.slice().sort((a, b) => {
    //   if (!a || !b || a.order == null || b.order == null) return 0;
    //   return a.order - b.order;
    // });

    // const [characters, setCharacters] = useState<Character[] | null>(null)
    const {characters, setCharacters} = useCharacters()
    const {countdown, setCountdown} = useSceneDelay();
    const { isTeleprompterActive } = useTeleprompter()
    // Not sure how to set initial value of countdown since it's context so I'll create state and initialize to the value from context
    const [delayCountdown, setDelayCountdown] = useState<number | null>(countdown)
    const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1) // Unless playing from a certain line

    var audio = useRef<HTMLAudioElement | null>(null)
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Track pending speech timeout
    const lastLineIndex = lineItems ? lineItems.length - 1 : -1 // -1 = invalid index. Easier than using null
    const currentLine = lineItems && (-1 != currentLineIndex) ? lineItems[currentLineIndex] : null
    const currentCharacter = currentLine && (-1 != currentLineIndex) ? characters?.find(char => char.id === currentLine.character_id) : null
    const sceneHasStarted = (-1 != currentLineIndex) && (null != currentCharacter)
    const [spokenText, setSpokenText] = useState<string | null>(null)

    // Track matched words for teleprompter highlighting
    const [matchedWordIndices, setMatchedWordIndices] = useState<number[]>([])

    // Algorithm toggle - set to false to use old system
    const [useAdvancedAlgorithm, setUseAdvancedAlgorithm] = useState<boolean>(true)

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
        // Use old simple algorithm if advanced is disabled
        if (!useAdvancedAlgorithm && isLineCloseEnough(currentLine.text, spokenText)) {
          if (isLastLine) {
            setSceneIsPlaying(false)
          } else {
            setCurrentLineIndex(prev => prev + 1)
          }
        }
        // Advanced algorithm handles completion via callbacks below
        
      // Handle other characters speaking
      } else {

        const lineDelay = Number(currentLine.delay * 1000) // Convert from s to ms

        speechTimeoutRef.current = setTimeout(function() {
          // Check if scene is still playing before executing
          if (!sceneIsPlaying) return;
          
          console.log(currentLine)
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
        }, lineDelay)
        
      }
      
    }, [currentLineIndex, spokenText])

    // Scroll to top when countdown starts (scene begins playing)
    useEffect(() => {
      if (sceneIsPlaying) {
        const scrollContainer = document.getElementById('main-scroll-container')
        if (scrollContainer) {
          console.log('🚀 Scrolling container to top')
          scrollContainer.scrollTo({
            top: 0,
            behavior: 'instant' // Instant for immediate effect
          })
        }
      }
    }, [sceneIsPlaying])

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

    // Clear matched words when line changes
    useEffect(() => {
      setMatchedWordIndices([])
    }, [currentLineIndex])

    // Update teleprompter data when relevant state changes
    useEffect(() => {
      if (onTeleprompterUpdate) {
        // Determine what to show in teleprompter
        const teleprompterLine = currentLine || (lineItems && lineItems[0]) || null
        const teleprompterCharacter = currentCharacter || 
          (characters && lineItems && lineItems[0] ? characters.find(char => char.id === lineItems[0].character_id) : null) || null
        
        onTeleprompterUpdate({
          currentLine: teleprompterLine,
          currentCharacter: teleprompterCharacter,
          matchedWordIndices: matchedWordIndices,
          delayCountdown: delayCountdown
        })
      }
    }, [currentLine, currentCharacter, matchedWordIndices, delayCountdown, onTeleprompterUpdate, lineItems, characters])

    // Cleanup audio and timeouts when player stops
    useEffect(() => {
      if (!sceneIsPlaying) {
        // Clear any pending speech timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current)
          speechTimeoutRef.current = null
        }
        // Stop any playing audio
        if (audio.current) {
          audio.current.pause()
          audio.current.currentTime = 0
          audio.current = null
        }
      }
    }, [sceneIsPlaying])

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        // Clear timeout on unmount
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current)
        }
        // Stop audio on unmount
        if (audio.current) {
          audio.current.pause()
          audio.current.currentTime = 0
        }
      }
    }, [])

    // Position tracker callbacks - memoized to prevent infinite loops
    const handleWordsMatched = useCallback((matchedIndices: number[]) => {
      setMatchedWordIndices(matchedIndices)
    }, [])

    const handleLineFullySpoken = useCallback(() => {
      console.log(`✅ Line fully spoken - advancing to next line`)
      setMatchedWordIndices([]) // Clear highlighting
      const isLastLine = lastLineIndex === currentLineIndex
      if (isLastLine) {
        setSceneIsPlaying(false)
      } else {
        setCurrentLineIndex(prev => prev + 1)
      }
    }, [lastLineIndex, currentLineIndex, setSceneIsPlaying])
    return (
        <>
          {
            lineItems?.map((line, idx) => {
              const isCurrentLine = line.id === currentLine?.id
              return <PlayerLine
                key={line.id}
                line={line}
                characters={characters}
                isCurrentLine={isCurrentLine}
                lineIndex={idx}
                currentLineIndex={currentLineIndex}
                matchedWordIndices={isCurrentLine ? matchedWordIndices : []}
              />
            })
          }
          {sceneIsPlaying && delayCountdown !== null && <CountdownModal countdown={delayCountdown} />}
          {sceneHasStarted && sceneIsPlaying && <MicTranscriber line={currentLine} listening={currentCharacter.is_me} setSpokenText={setSpokenText} onLineSpoken={() => console.log("go to next line....")}/>}

          {/* Position Tracker - Shows where you are in the current line */}
          {useAdvancedAlgorithm && sceneHasStarted && sceneIsPlaying && (
            <LinePositionTracker
              currentLine={currentLine}
              spokenText={spokenText}
              isListening={currentCharacter?.is_me || false}
              onWordsMatched={handleWordsMatched}
              onLineFullySpoken={handleLineFullySpoken}
              enableDebugMode={true} // Set to false to hide debug overlay
              enableAlgorithm={true}
            />
          )}
        </>
    )
}

export default PlayerLineList