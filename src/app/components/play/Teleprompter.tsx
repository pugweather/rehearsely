"use client"
import React from 'react'
import { DraftLine, Character } from '@/app/types'

type Props = {
  currentLine: DraftLine | null
  currentCharacter: Character | null
  matchedWordIndices: number[]
  buttonsWrapperHeight?: number
}

const Teleprompter = ({ currentLine, currentCharacter, matchedWordIndices, buttonsWrapperHeight = 80 }: Props) => {
  if (!currentLine?.text || !currentCharacter) return null

  const isUserTurn = currentCharacter.is_me === true

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

  const renderHighlightedText = () => {
    if (!currentLine?.text) return null

    // Split original text into words, preserving original formatting
    const words = currentLine.text.split(/(\s+)/) // This preserves whitespace
    const normalizedWords = getWords(currentLine.text)

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
          <span key={i} style={{ color: '#FFA05A' }}>
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

  // Calculate height: 100vh - (buttons wrapper height + distance from bottom + top padding + bottom padding)
  const distanceFromBottom = 16 // 1rem = 16px (bottom-4)
  const topPadding = 32 // 2rem
  const bottomPadding = 32 // 2rem
  const teleprompterHeight = `calc(100vh - ${buttonsWrapperHeight + distanceFromBottom + topPadding + bottomPadding}px)`

  const displayCharacterName = () => {
    if (!currentCharacter) return ''
    return currentCharacter.is_me ? `${currentCharacter.name} (me)` : currentCharacter.name
  }

  return (
    <div
      className="fixed left-8 right-8 top-8 flex flex-col rounded-3xl overflow-hidden"
      style={{
        height: teleprompterHeight,
        backgroundColor: '#1a2332',
        zIndex: 25,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header with character name and user indicator */}
      <div
        className="flex items-center justify-center py-6 px-8 border-b relative"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backgroundColor: isUserTurn ? 'rgba(255, 160, 90, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* User turn indicator - pulsing dot on left */}
        {isUserTurn && (
          <div className="absolute left-6 flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: '#FFA05A',
                boxShadow: '0 0 12px rgba(255, 160, 90, 0.8)',
              }}
            />
          </div>
        )}

        <span
          className="text-2xl font-semibold tracking-wide uppercase"
          style={{
            color: isUserTurn ? '#FFA05A' : 'rgba(255, 255, 255, 0.9)',
          }}
        >
          {displayCharacterName()}
        </span>

        {/* User turn indicator - "YOUR TURN" badge on right */}
        {isUserTurn && (
          <div
            className="absolute right-6 px-4 py-1 rounded-full text-sm font-bold tracking-wider"
            style={{
              backgroundColor: 'rgba(255, 160, 90, 0.25)',
              color: '#FFA05A',
              border: '2px solid #FFA05A',
            }}
          >
            YOUR TURN
          </div>
        )}
      </div>

      {/* Main text area */}
      <div className="flex-1 flex items-start justify-center pt-16 px-12 overflow-hidden">
        <div
          className="text-center whitespace-pre-wrap leading-relaxed"
          style={{
            fontSize: '3rem',
            color: 'white',
            maxWidth: '50rem', // Limit width like in the line list
          }}
        >
          {matchedWordIndices.length > 0 ? renderHighlightedText() : currentLine.text}
        </div>
      </div>
    </div>
  )
}

export default Teleprompter