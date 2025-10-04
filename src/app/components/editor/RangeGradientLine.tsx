"use client"
import React, { useEffect, useState, useRef } from 'react'
import { usePracticeRange } from '@/app/context/practiceRangeContext'

const RangeGradientLine: React.FC = () => {
  const { startLineId, endLineId, isRangeSelectionMode } = usePracticeRange()
  const [linePosition, setLinePosition] = useState<{ top: number; height: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startLineId || !endLineId || !isRangeSelectionMode) {
      setLinePosition(null)
      return
    }

    // Find the DOM elements for start and end lines
    const startElement = document.querySelector(`[data-line-id="${startLineId}"]`)
    const endElement = document.querySelector(`[data-line-id="${endLineId}"]`)

    if (!startElement || !endElement) return

    const startRect = startElement.getBoundingClientRect()
    const endRect = endElement.getBoundingClientRect()
    
    // Calculate position relative to viewport
    const top = startRect.top + window.scrollY
    const bottom = endRect.bottom + window.scrollY
    const height = bottom - top

    setLinePosition({ top, height })
  }, [startLineId, endLineId, isRangeSelectionMode])

  if (!linePosition || !isRangeSelectionMode) return null

  return (
    <div
      ref={containerRef}
      className="fixed left-8 z-10 pointer-events-none"
      style={{
        top: linePosition.top,
        height: linePosition.height,
        width: '4px',
        background: 'linear-gradient(to bottom, #22c55e, #ef4444)',
        borderRadius: '2px',
        boxShadow: '0 0 8px rgba(0,0,0,0.2)',
        opacity: 0.8
      }}
    />
  )
}

export default RangeGradientLine
