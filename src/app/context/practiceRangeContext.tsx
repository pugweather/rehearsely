"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface PracticeRangeContextType {
  isRangeSelectionMode: boolean
  setIsRangeSelectionMode: (value: boolean) => void
  startLineId: number | null
  setStartLineId: (value: number | null) => void
  endLineId: number | null
  setEndLineId: (value: number | null) => void
  clickedLineId: number | null
  setClickedLineId: (value: number | null) => void
  isRangeSet: () => boolean
  hasSelection: () => boolean
  clearRange: () => void
  saveRange: () => void
}

const PracticeRangeContext = createContext<PracticeRangeContextType | undefined>(undefined)

export const usePracticeRange = (): PracticeRangeContextType => {
  const context = useContext(PracticeRangeContext)
  if (!context) {
    throw new Error('usePracticeRange must be used within a PracticeRangeProvider')
  }
  return context
}

interface PracticeRangeProviderProps {
  children: ReactNode
  sceneId?: number
}

export const PracticeRangeProvider: React.FC<PracticeRangeProviderProps> = ({ children, sceneId }) => {
  const [isRangeSelectionMode, setIsRangeSelectionMode] = useState(false)
  const [startLineId, setStartLineId] = useState<number | null>(null)
  const [endLineId, setEndLineId] = useState<number | null>(null)
  const [clickedLineId, setClickedLineId] = useState<number | null>(null)
  const [savedStartLineId, setSavedStartLineId] = useState<number | null>(null)
  const [savedEndLineId, setSavedEndLineId] = useState<number | null>(null)

  // Load saved range from localStorage on mount
  useEffect(() => {
    if (sceneId && typeof window !== 'undefined') {
      const storageKey = `scene-range-${sceneId}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        try {
          const { startLineId, endLineId } = JSON.parse(stored)
          setSavedStartLineId(startLineId)
          setSavedEndLineId(endLineId)
          setStartLineId(startLineId)
          setEndLineId(endLineId)
        } catch (e) {
          console.error('Failed to parse stored range data', e)
        }
      }
    }
  }, [sceneId])

  // When entering range selection mode, restore temporary changes or load from saved
  useEffect(() => {
    if (isRangeSelectionMode) {
      // If we have no current selection, restore from saved
      if (startLineId === null && endLineId === null) {
        setStartLineId(savedStartLineId)
        setEndLineId(savedEndLineId)
      }
    } else {
      // When exiting without saving, revert to saved state
      setStartLineId(savedStartLineId)
      setEndLineId(savedEndLineId)
      setClickedLineId(null)
    }
  }, [isRangeSelectionMode])

  const isRangeSet = () => {
    return startLineId !== null && endLineId !== null
  }

  const hasSelection = () => {
    return startLineId !== null || endLineId !== null
  }

  const saveRange = () => {
    // Save current range to savedState and localStorage
    setSavedStartLineId(startLineId)
    setSavedEndLineId(endLineId)

    if (sceneId && typeof window !== 'undefined') {
      const storageKey = `scene-range-${sceneId}`
      if (startLineId === null && endLineId === null) {
        localStorage.removeItem(storageKey)
      } else {
        localStorage.setItem(storageKey, JSON.stringify({ startLineId, endLineId }))
      }
    }
  }

  const clearRange = () => {
    setStartLineId(null)
    setEndLineId(null)
    setClickedLineId(null)
    setIsRangeSelectionMode(false)
    setSavedStartLineId(null)
    setSavedEndLineId(null)

    if (sceneId && typeof window !== 'undefined') {
      localStorage.removeItem(`scene-range-${sceneId}`)
    }
  }

  const value: PracticeRangeContextType = {
    isRangeSelectionMode,
    setIsRangeSelectionMode,
    startLineId,
    setStartLineId,
    endLineId,
    setEndLineId,
    clickedLineId,
    setClickedLineId,
    isRangeSet,
    hasSelection,
    clearRange,
    saveRange,
  }

  return (
    <PracticeRangeContext.Provider value={value}>
      {children}
    </PracticeRangeContext.Provider>
  )
}
