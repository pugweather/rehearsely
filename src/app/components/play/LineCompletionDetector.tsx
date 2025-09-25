'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { DraftLine } from '@/app/types'

interface LinePositionTrackerProps {
  currentLine: DraftLine | null
  spokenText: string | null
  isListening: boolean
  onWordsMatched?: (matchedWordIndices: number[]) => void // For teleprompter highlighting
  onLineFullySpoken?: () => void // Called when entire line is highlighted
  // Debug/testing props
  enableDebugMode?: boolean
  enableAlgorithm?: boolean // Easy toggle on/off
}

interface SpokenWord {
  word: string
  timestamp: number
  matched: boolean
  wordIndex: number // Position in the expected words array
}

interface SimpleConfig {
  wordSimilarityThreshold: number
}

export default function LinePositionTracker({
  currentLine,
  spokenText,
  isListening,
  onWordsMatched,
  onLineFullySpoken,
  enableDebugMode = false,
  enableAlgorithm = true
}: LinePositionTrackerProps) {

  // Simple configuration
  const config: SimpleConfig = {
    wordSimilarityThreshold: 0.8 // How similar words need to be (Levenshtein-based)
  }

  // State - track progressive position in the line
  const [furthestWordIndex, setFurthestWordIndex] = useState<number>(-1) // -1 means no words matched yet
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Refs
  const lastSpokenTextRef = useRef<string>('')

  // Early return if algorithm disabled
  if (!enableAlgorithm) {
    return null
  }


  // Reset position when line changes
  useEffect(() => {
    setFurthestWordIndex(-1)
  }, [currentLine])

  // Process new speech
  useEffect(() => {
    if (!spokenText || !isListening || !currentLine?.text) return

    // Only process if spokenText actually changed
    if (spokenText === lastSpokenTextRef.current) return
    lastSpokenTextRef.current = spokenText

    // Define utility functions within useEffect to avoid dependency issues
    const normalizeTextLocal = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const getWordsLocal = (text: string): string[] => {
      return normalizeTextLocal(text).split(' ').filter(word => word.length > 0)
    }

    const getWordSimilarityLocal = (word1: string, word2: string): number => {
      const w1 = word1.toLowerCase()
      const w2 = word2.toLowerCase()

      if (w1 === w2) return 1.0

      const maxLen = Math.max(w1.length, w2.length)
      if (maxLen === 0) return 1.0

      // Simple Levenshtein distance inline
      const matrix = []
      for (let i = 0; i <= w2.length; i++) {
        matrix[i] = [i]
      }
      for (let j = 0; j <= w1.length; j++) {
        matrix[0][j] = j
      }
      for (let i = 1; i <= w2.length; i++) {
        for (let j = 1; j <= w1.length; j++) {
          if (w2.charAt(i - 1) === w1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          }
        }
      }
      const distance = matrix[w2.length][w1.length]
      return 1 - (distance / maxLen)
    }

    const newSpokenWords = getWordsLocal(spokenText)
    const expectedWords = getWordsLocal(currentLine.text)

    if (newSpokenWords.length === 0 || expectedWords.length === 0) return

    // Find the furthest position we can confirm in the script
    setFurthestWordIndex(currentFurthest => {
      let newFurthestIndex = currentFurthest

      // For each spoken word, see if it matches any expected word at or after our current position
      for (const spokenWord of newSpokenWords) {
        // Look for matches starting from our current furthest position
        for (let i = Math.max(0, currentFurthest); i < expectedWords.length; i++) {
          const similarity = getWordSimilarityLocal(spokenWord, expectedWords[i])
          if (similarity >= config.wordSimilarityThreshold) {
            // Found a match! Update our furthest position
            newFurthestIndex = Math.max(newFurthestIndex, i)
            break // Move on to next spoken word
          }
        }
      }

      // Only update if we made progress
      return newFurthestIndex > currentFurthest ? newFurthestIndex : currentFurthest
    })

  }, [spokenText, isListening, currentLine?.text, config.wordSimilarityThreshold])

  // Notify parent component about progressive highlighting
  useEffect(() => {
    if (onWordsMatched) {
      // Create array of indices from 0 to furthestWordIndex
      const progressiveIndices = furthestWordIndex >= 0
        ? Array.from({length: furthestWordIndex + 1}, (_, i) => i)
        : []
      onWordsMatched(progressiveIndices)
    }
  }, [furthestWordIndex, onWordsMatched])

  // Check if entire line is complete and update debug info
  useEffect(() => {
    if (currentLine?.text) {
      // Inline function to avoid dependency issues
      const getWordsLocal = (text: string): string[] => {
        return text
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .split(' ')
          .filter(word => word.length > 0)
      }

      const expectedWords = getWordsLocal(currentLine.text)
      const totalWords = expectedWords.length
      const wordsSpoken = furthestWordIndex + 1
      const progressRatio = wordsSpoken / totalWords

      // Check if entire line is complete (all words highlighted)
      if (wordsSpoken >= totalWords && onLineFullySpoken) {
        onLineFullySpoken()
      }

      // Update debug info
      if (enableDebugMode) {
        setDebugInfo({
          expectedWords,
          furthestWordIndex,
          progressRatio,
          wordsSpoken,
          totalWords,
          isComplete: wordsSpoken >= totalWords
        })
      }
    }
  }, [currentLine?.text, furthestWordIndex, enableDebugMode, onLineFullySpoken])

  // Debug UI (only shown when debug mode enabled)
  if (enableDebugMode) {
    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-md z-50">
        <h3 className="text-sm font-bold mb-2">Position Tracker Debug</h3>
        <div className="space-y-1">
          <div>Expected: {debugInfo.expectedWords?.join(' ') || 'None'}</div>
          <div>Furthest Index: {debugInfo.furthestWordIndex ?? 'None'}</div>
          <div>Progress: {debugInfo.wordsSpoken || 0}/{debugInfo.totalWords || 0} words ({((debugInfo.progressRatio || 0) * 100).toFixed(1)}%)</div>
          <div>Highlighting: {furthestWordIndex >= 0 ? `Words 0-${furthestWordIndex}` : 'None'}</div>
          <div className={debugInfo.isComplete ? 'text-green-400' : 'text-white'}>
            Status: {debugInfo.isComplete ? '✅ COMPLETE' : '⏳ In Progress'}
          </div>
        </div>
      </div>
    )
  }

  return null // Component is invisible in production
}

export type { LinePositionTrackerProps, SpokenWord, SimpleConfig }