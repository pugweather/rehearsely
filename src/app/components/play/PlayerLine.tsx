import React, { useRef, useEffect } from 'react'
import { Character, DraftLine, Line} from '@/app/types';
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import clsx from 'clsx';
import localFont from "next/font/local";

const courierPrimeRegular = localFont({
    src: "../../../../public/fonts/courierPrimeRegular.ttf",
})

// TODO: How to deal with adding voice to this. Feels inefficient to import all voices and select voice by character voice_id and add to linebeingediteddata

type Props = {
  line: DraftLine | null,
  characters: Character[] | null,
  isCurrentLine: boolean
  lineIndex: number,
  currentLineIndex: number | null
  matchedWordIndices?: number[] // For teleprompter highlighting
}

const PlayerLine = ({line, characters, isCurrentLine, lineIndex, currentLineIndex, matchedWordIndices = []}: Props) => {
  const lineRef = useRef<HTMLDivElement>(null)

  // Scroll current line to 30% from top of viewport
  useEffect(() => {
    if (isCurrentLine && lineRef.current) {
      const scrollContainer = document.getElementById('main-scroll-container')
      if (!scrollContainer) return

      const lineRect = lineRef.current.getBoundingClientRect()
      const containerRect = scrollContainer.getBoundingClientRect()

      // Calculate where the line is relative to the scroll container
      const lineTopRelativeToContainer = lineRect.top - containerRect.top + scrollContainer.scrollTop

      // Calculate target scroll position (30% from top of viewport)
      const targetScroll = lineTopRelativeToContainer - (scrollContainer.clientHeight * 0.3)

      console.log('📍 Scrolling current line into view at 30%')
      scrollContainer.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      })
    }
  }, [isCurrentLine])

  const lineAlreadySpoken = currentLineIndex != null && lineIndex < currentLineIndex
  const currCharacter = characters?.find(char => char.id === line?.character_id)

  if (line == null) return

  const displaySelectedCharacterName = () => {

    let res = ""

    const charIsMe = currCharacter?.is_me === true

    if (currCharacter) {
        res += currCharacter.name
    } if (charIsMe) {
        res += ' (me)'
    }

    return res
  }

  const renderHighlightedText = () => {
    if (!line?.text) return null
    const normalizeText = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const getWords = (text: string): string[] => {
      return normalizeText(text).split(' ').filter(word => word.length > 0)
    }

    // Split original text into words, preserving original formatting
    const words = line.text.split(/(\s+)/) // This preserves whitespace
    const normalizedWords = getWords(line.text)

    let result = []
    let normalizedIndex = 0

    for (let i = 0; i < words.length; i++) {
      const word = words[i]

      // Check if this is whitespace
      if (/^\s+$/.test(word)) {
        result.push(<span key={i}>{word}</span>)
        continue
      }

      // Check if this normalized word index is in our matched indices
      const isMatched = matchedWordIndices.includes(normalizedIndex)

      if (isMatched) {
        result.push(
          <span key={i} className="font-bold text-black">
            {word}
          </span>
        )
      } else {
        result.push(<span key={i}>{word}</span>)
      }

      normalizedIndex++
    }

    return result
  }

  return (
    <div
      ref={lineRef}
      className={clsx(
        `w-full text-center mb-10 rounded-2xl pl-10 pr-10 py-3 border border-transparent ${courierPrimeRegular.className}`,
        lineAlreadySpoken ? "opacity-30" : ""
      )}
      style={{
        backgroundColor: isCurrentLine ? 'rgba(255,160,90,0.08)' : 'transparent',
        borderColor: isCurrentLine ? 'rgba(255,160,90,0.2)' : 'transparent',
      }}>
        <div className='text-lg tracking-wider uppercase text-gray-700 mb-2 font-semibold'>{displaySelectedCharacterName()}</div>
        <div className='text-xl leading-relaxed text-black whitespace-pre-wrap'>
          {isCurrentLine && matchedWordIndices.length > 0 ? renderHighlightedText() : line.text}
        </div>
    </div>
  )
}

export default PlayerLine