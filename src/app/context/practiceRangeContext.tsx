"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react'

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
  clearRange: () => void
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
}

export const PracticeRangeProvider: React.FC<PracticeRangeProviderProps> = ({ children }) => {
  const [isRangeSelectionMode, setIsRangeSelectionMode] = useState(false)
  const [startLineId, setStartLineId] = useState<number | null>(null)
  const [endLineId, setEndLineId] = useState<number | null>(null)
  const [clickedLineId, setClickedLineId] = useState<number | null>(null)

  const isRangeSet = () => {
    return startLineId !== null && endLineId !== null
  }

  const clearRange = () => {
    setStartLineId(null)
    setEndLineId(null)
    setClickedLineId(null)
    setIsRangeSelectionMode(false)
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
    clearRange,
  }

  return (
    <PracticeRangeContext.Provider value={value}>
      {children}
    </PracticeRangeContext.Provider>
  )
}
