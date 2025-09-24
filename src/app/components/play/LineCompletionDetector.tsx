'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { DraftLine } from '@/app/types'

interface LineCompletionDetectorProps {
  currentLine: DraftLine | null
  allLines: DraftLine[]
  currentLineIndex: number
  spokenText: string | null
  isListening: boolean
  onLineCompleted: (completedLineIndex: number) => void
  onLineSkipped: (fromIndex: number, toIndex: number) => void
  // Debug/testing props
  enableDebugMode?: boolean
  enableAlgorithm?: boolean // Easy toggle on/off
}

interface WordMatch {
  word: string
  position: number
  confidence: number
  matchType: 'exact' | 'fuzzy' | 'phonetic' | 'semantic'
  timestamp: number
}

interface LineConfidence {
  lineIndex: number
  overallScore: number
  wordMatches: WordMatch[]
  sequentialScore: number
  finalZoneScore: number
  coverageScore: number
  lastActivity: number
}

interface AlgorithmConfig {
  // Completion thresholds
  shortLineThreshold: number // words
  shortLineMinScore: number
  longLineMinScore: number
  finalZoneWeight: number
  sequentialWeight: number

  // Timing
  silenceTimeoutMs: number
  wordTimeoutMs: number

  // Matching weights
  exactMatchWeight: number
  fuzzyMatchWeight: number
  phoneticMatchWeight: number
  semanticMatchWeight: number

  // Fuzzy matching
  maxLevenshteinDistance: number

  // Rolling buffer
  bufferTimeMs: number
}

export default function LineCompletionDetector({
  currentLine,
  allLines,
  currentLineIndex,
  spokenText,
  isListening,
  onLineCompleted,
  onLineSkipped,
  enableDebugMode = false,
  enableAlgorithm = true
}: LineCompletionDetectorProps) {

  // Algorithm configuration
  const config: AlgorithmConfig = {
    shortLineThreshold: 5,
    shortLineMinScore: 0.6,
    longLineMinScore: 0.75,
    finalZoneWeight: 2.0,
    sequentialWeight: 1.5,
    silenceTimeoutMs: 3000,
    wordTimeoutMs: 1000,
    exactMatchWeight: 1.0,
    fuzzyMatchWeight: 0.7,
    phoneticMatchWeight: 0.6,
    semanticMatchWeight: 0.5,
    maxLevenshteinDistance: 2,
    bufferTimeMs: 60000 // 60 seconds rolling buffer
  }

  // State
  const [rollingBuffer, setRollingBuffer] = useState<string[]>([])
  const [lineConfidences, setLineConfidences] = useState<LineConfidence[]>([])
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Refs
  const lastSpeechTime = useRef<number>(0)
  const silenceTimer = useRef<NodeJS.Timeout | null>(null)
  const processedTokens = useRef<Set<string>>(new Set())

  // Early return if algorithm disabled
  if (!enableAlgorithm) {
    return null
  }

  // Utility functions
  const normalizeText = useCallback((text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }, [])

  const getWords = useCallback((text: string): string[] => {
    return normalizeText(text).split(' ').filter(word => word.length > 0)
  }, [normalizeText])

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = useCallback((str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    )

    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i
    }

    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }, [])

  // Simple phonetic matching (Soundex-like)
  const getPhoneticCode = useCallback((word: string): string => {
    let code = word.charAt(0).toLowerCase()

    const phoneticMap: { [key: string]: string } = {
      'b': '1', 'f': '1', 'p': '1', 'v': '1',
      'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
      'd': '3', 't': '3',
      'l': '4',
      'm': '5', 'n': '5',
      'r': '6'
    }

    for (let i = 1; i < word.length; i++) {
      const char = word.charAt(i).toLowerCase()
      const phoneticValue = phoneticMap[char]
      if (phoneticValue && phoneticValue !== code.charAt(code.length - 1)) {
        code += phoneticValue
      }
    }

    return code.substring(0, 4).padEnd(4, '0')
  }, [])

  // Basic semantic similarity (could be enhanced with word embeddings)
  const getSemanticSimilarity = useCallback((word1: string, word2: string): number => {
    const synonymGroups = [
      ['angry', 'mad', 'furious', 'livid'],
      ['happy', 'glad', 'joyful', 'pleased'],
      ['sad', 'unhappy', 'depressed', 'down'],
      ['go', 'move', 'walk', 'head'],
      ['house', 'home', 'building'],
      ['yes', 'yeah', 'yep', 'sure'],
      ['no', 'nope', 'nah']
    ]

    for (const group of synonymGroups) {
      if (group.includes(word1.toLowerCase()) && group.includes(word2.toLowerCase())) {
        return 0.8 // High semantic similarity
      }
    }

    return 0 // No semantic similarity found
  }, [])

  // Match word against expected word with different algorithms
  const matchWord = useCallback((spokenWord: string, expectedWord: string): WordMatch | null => {
    const timestamp = Date.now()

    // Exact match
    if (spokenWord.toLowerCase() === expectedWord.toLowerCase()) {
      return {
        word: expectedWord,
        position: -1, // Will be set later
        confidence: config.exactMatchWeight,
        matchType: 'exact',
        timestamp
      }
    }

    // Fuzzy match
    const distance = levenshteinDistance(spokenWord.toLowerCase(), expectedWord.toLowerCase())
    if (distance <= config.maxLevenshteinDistance) {
      const fuzzyConfidence = (1 - distance / Math.max(spokenWord.length, expectedWord.length)) * config.fuzzyMatchWeight
      if (fuzzyConfidence > 0.3) {
        return {
          word: expectedWord,
          position: -1,
          confidence: fuzzyConfidence,
          matchType: 'fuzzy',
          timestamp
        }
      }
    }

    // Phonetic match
    if (getPhoneticCode(spokenWord) === getPhoneticCode(expectedWord)) {
      return {
        word: expectedWord,
        position: -1,
        confidence: config.phoneticMatchWeight,
        matchType: 'phonetic',
        timestamp
      }
    }

    // Semantic match
    const semanticSimilarity = getSemanticSimilarity(spokenWord, expectedWord)
    if (semanticSimilarity > 0) {
      return {
        word: expectedWord,
        position: -1,
        confidence: semanticSimilarity * config.semanticMatchWeight,
        matchType: 'semantic',
        timestamp
      }
    }

    return null
  }, [levenshteinDistance, getPhoneticCode, getSemanticSimilarity, config])

  // Calculate line confidence scores
  const calculateLineConfidence = useCallback((line: DraftLine, lineIndex: number, spokenWords: string[]): LineConfidence => {
    if (!line.text) {
      return {
        lineIndex,
        overallScore: 0,
        wordMatches: [],
        sequentialScore: 0,
        finalZoneScore: 0,
        coverageScore: 0,
        lastActivity: 0
      }
    }

    const expectedWords = getWords(line.text)
    const wordMatches: WordMatch[] = []
    const now = Date.now()

    // Match spoken words against expected words
    for (const spokenWord of spokenWords) {
      for (let i = 0; i < expectedWords.length; i++) {
        const match = matchWord(spokenWord, expectedWords[i])
        if (match) {
          match.position = i
          wordMatches.push(match)
          break // Only match each spoken word once
        }
      }
    }

    // Remove duplicate matches (keep highest confidence)
    const uniqueMatches = wordMatches.reduce((acc, match) => {
      const existing = acc.find(m => m.position === match.position)
      if (!existing || match.confidence > existing.confidence) {
        return [...acc.filter(m => m.position !== match.position), match]
      }
      return acc
    }, [] as WordMatch[])

    // Calculate coverage score
    const coverageScore = uniqueMatches.length / expectedWords.length

    // Calculate sequential score (words in order)
    let sequentialMatches = 0
    const sortedMatches = uniqueMatches.sort((a, b) => a.position - b.position)
    for (let i = 0; i < sortedMatches.length - 1; i++) {
      if (sortedMatches[i + 1].position > sortedMatches[i].position) {
        sequentialMatches++
      }
    }
    const sequentialScore = sequentialMatches / Math.max(1, uniqueMatches.length - 1)

    // Calculate final zone score (last 20% of words)
    const finalZoneStart = Math.floor(expectedWords.length * 0.8)
    const finalZoneMatches = uniqueMatches.filter(match => match.position >= finalZoneStart)
    const finalZoneScore = finalZoneMatches.length / Math.max(1, expectedWords.length - finalZoneStart)

    // Calculate overall score
    const isShortLine = expectedWords.length <= config.shortLineThreshold
    const baseScore = coverageScore
    const sequentialBonus = sequentialScore * config.sequentialWeight
    const finalZoneBonus = finalZoneScore * config.finalZoneWeight

    let overallScore = baseScore + (sequentialBonus * 0.2) + (finalZoneBonus * 0.3)

    // Apply confidence weights from word matches
    const avgConfidence = uniqueMatches.reduce((sum, match) => sum + match.confidence, 0) / Math.max(1, uniqueMatches.length)
    overallScore *= avgConfidence

    // Get last activity time
    const lastActivity = uniqueMatches.length > 0
      ? Math.max(...uniqueMatches.map(match => match.timestamp))
      : 0

    return {
      lineIndex,
      overallScore,
      wordMatches: uniqueMatches,
      sequentialScore,
      finalZoneScore,
      coverageScore,
      lastActivity
    }
  }, [getWords, matchWord, config])

  // Process new speech input
  const processSpeech = useCallback(() => {
    if (!spokenText || !isListening) return

    const now = Date.now()
    lastSpeechTime.current = now

    // Clear silence timer
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current)
    }

    // Update rolling buffer
    setRollingBuffer(prev => {
      const words = getWords(spokenText)
      const newBuffer = [...prev, ...words]

      // Remove old words outside buffer time
      const cutoffTime = now - config.bufferTimeMs
      return newBuffer.filter((_, index) =>
        (now - (index * 100)) > cutoffTime // Approximate timestamp
      )
    })

    // Calculate confidences for current line and next few lines
    const bufferWords = rollingBuffer.concat(getWords(spokenText))
    const confidences: LineConfidence[] = []

    // Check current line
    if (currentLine) {
      confidences.push(calculateLineConfidence(currentLine, currentLineIndex, bufferWords))
    }

    // Check next 3 lines for line skipping
    for (let i = 1; i <= 3; i++) {
      const nextIndex = currentLineIndex + i
      if (nextIndex < allLines.length) {
        confidences.push(calculateLineConfidence(allLines[nextIndex], nextIndex, bufferWords))
      }
    }

    setLineConfidences(confidences)

    // Check for completion or line skipping
    const currentLineConfidence = confidences.find(c => c.lineIndex === currentLineIndex)
    const bestAlternative = confidences.filter(c => c.lineIndex !== currentLineIndex)
      .reduce((best, current) =>
        current.overallScore > (best?.overallScore || 0) ? current : best, null as LineConfidence | null
      )

    if (currentLineConfidence) {
      const isShortLine = currentLine && getWords(currentLine.text || '').length <= config.shortLineThreshold
      const threshold = isShortLine ? config.shortLineMinScore : config.longLineMinScore

      // Check if current line is completed
      if (currentLineConfidence.overallScore >= threshold) {
        onLineCompleted(currentLineIndex)
        return
      }

      // Check if user jumped to a future line
      if (bestAlternative && bestAlternative.overallScore > currentLineConfidence.overallScore * 1.5) {
        const futureThreshold = getWords(allLines[bestAlternative.lineIndex]?.text || '').length <= config.shortLineThreshold
          ? config.shortLineMinScore
          : config.longLineMinScore

        if (bestAlternative.overallScore >= futureThreshold) {
          onLineSkipped(currentLineIndex, bestAlternative.lineIndex)
          return
        }
      }
    }

    // Set silence timeout
    silenceTimer.current = setTimeout(() => {
      // Check if we should auto-complete based on silence + partial completion
      if (currentLineConfidence && currentLineConfidence.overallScore >= 0.5) {
        onLineCompleted(currentLineIndex)
      }
    }, config.silenceTimeoutMs)

    // Update debug info
    if (enableDebugMode) {
      setDebugInfo({
        bufferWords: bufferWords.slice(-10), // Last 10 words
        currentScore: currentLineConfidence?.overallScore || 0,
        confidences: confidences.map(c => ({
          lineIndex: c.lineIndex,
          score: c.overallScore,
          coverage: c.coverageScore,
          finalZone: c.finalZoneScore
        })),
        lastProcessed: now
      })
    }

  }, [spokenText, isListening, rollingBuffer, currentLine, allLines, currentLineIndex, calculateLineConfidence, getWords, config, onLineCompleted, onLineSkipped, enableDebugMode])

  // Process speech when spokenText changes
  useEffect(() => {
    processSpeech()
  }, [processSpeech])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current)
      }
    }
  }, [])

  // Debug UI (only shown when debug mode enabled)
  if (enableDebugMode) {
    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-md z-50">
        <h3 className="text-sm font-bold mb-2">Line Completion Debug</h3>
        <div className="space-y-1">
          <div>Buffer: {debugInfo.bufferWords?.join(' ') || 'Empty'}</div>
          <div>Current Score: {(debugInfo.currentScore || 0).toFixed(2)}</div>
          <div>Confidences:</div>
          {debugInfo.confidences?.map((conf: any, i: number) => (
            <div key={i} className="ml-2">
              Line {conf.lineIndex}: {conf.score.toFixed(2)} (cov: {conf.coverage.toFixed(2)}, final: {conf.finalZone.toFixed(2)})
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null // Component is invisible in production
}

export type { LineCompletionDetectorProps, WordMatch, LineConfidence, AlgorithmConfig }