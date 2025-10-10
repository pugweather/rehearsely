import React from 'react'
import { Character, DraftLine, LineBeingEditedData } from '@/app/types';
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import { usePracticeRange } from '@/app/context/practiceRangeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faPlus } from '@fortawesome/free-solid-svg-icons';
import localFont from "next/font/local";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const courierPrimeRegular = localFont({
    src: "../../../../public/fonts/courierPrimeRegular.ttf",
})

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

// TODO: How to deal with adding voice to this. Feels inefficient to import all voices and select voice by character voice_id and add to linebeingediteddata

type Props = {
  line: DraftLine | null,
  lines: DraftLine[] | null,
  characters: Character[] | null,
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>,
  setLineBeingEdited: React.Dispatch<React.SetStateAction<DraftLine | null>>,
  setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>;
  setShouldScroll: React.Dispatch<React.SetStateAction<boolean>>;
  setOriginalCharForOpenedLine: React.Dispatch<React.SetStateAction<Character | null>>;
  index: number;
  isDragDisabled: boolean;
  onAddLineBelow: (afterLineOrder: number) => void;
}

const SavedLine = ({line, lines, characters, setLines, setLineBeingEdited, setLineBeingEditedData, setShouldScroll, setOriginalCharForOpenedLine, index, isDragDisabled, onAddLineBelow}: Props) => {

  const TEMP_LINE_ID = -999
  const currCharacter = characters?.find(char => Number(char.id) === Number(line?.character_id)) ||  null
  const voices = useVoicesStore((s) => s.voices)
  const isCharactersLoading = !characters || characters.length === 0
  
  // Practice range context
  const {
    isRangeSelectionMode,
    startLineId,
    endLineId,
    setStartLineId,
    setEndLineId,
    clickedLineId,
    setClickedLineId
  } = usePracticeRange()

  // Track mouse position for click vs drag detection
  const [mouseDownPos, setMouseDownPos] = React.useState<{x: number, y: number} | null>(null)
  
  // Track hover state for "Add line below" button
  const [isHovered, setIsHovered] = React.useState(false)

  // Track ref to the element to reset styles
  const lineRef = React.useRef<HTMLDivElement>(null)

  // Reset hover state and styles when EditLine opens or closes
  React.useEffect(() => {
    if (isDragDisabled) {
      setIsHovered(false)
      // Reset inline styles
      if (lineRef.current) {
        lineRef.current.style.backgroundColor = 'transparent'
        lineRef.current.style.borderColor = 'transparent'
      }
    }
  }, [isDragDisabled])

  // Reset hover state when range selection mode changes
  React.useEffect(() => {
    if (isRangeSelectionMode) {
      setIsHovered(false)
    }
  }, [isRangeSelectionMode])

  if (line == null) return

  const handleSetLineToEditMode = () => {
    // Don't open edit mode if we're in range selection mode
    if (isRangeSelectionMode) return
    
    // Prevent opening EditLine if characters are still loading or line is being deleted
    if (!characters || characters.length === 0) {
      return;
    }
    
    if (line?.isDeleting) {
      return;
    }

    setShouldScroll(true)
    setLineBeingEdited(line)
    // Get voice object to pass into the edit mode line
    const voice = voices?.find(voice => String(voice.voice_id) == String(currCharacter?.voice_id)) // TODO: For some reason when i remove the string conversion it says one I can't compared nums and strs????
    setLineBeingEditedData({
      character: currCharacter || null,
      text: line.text,
      order: line.order,
      speed: line.speed,
      delay: line.delay,
      voice: voice || null
    })
    setOriginalCharForOpenedLine(currCharacter)
    removeTempLine()
  }

  const handleRangeSelection = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!line?.id) return

    // If clicking the same line, toggle it off. Otherwise, set this line as clicked
    if (clickedLineId === line.id) {
      setClickedLineId(null)
    } else {
      setClickedLineId(line.id)
    }
  }

  const handleSetAsStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!line?.id || !line?.order || !lines) return

    // If this line is already the start, clear it
    if (isStartPoint) {
      setStartLineId(null)
    } else {
      // If this line is the end, clear end first before setting as start
      if (isEndPoint) {
        setEndLineId(null)
      }
      // If there's an end and this line is after it, clear the end
      else if (endLineId) {
        const endLine = lines.find(l => l.id === endLineId)
        if (endLine?.order && line.order > endLine.order) {
          setEndLineId(null)
        }
      }
      setStartLineId(line.id)
    }
    setClickedLineId(null)
  }

  const handleSetAsEnd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!line?.id || !line?.order || !lines) return

    // If this line is already the end, clear it
    if (isEndPoint) {
      setEndLineId(null)
    } else {
      // If this line is the start, clear start first before setting as end
      if (isStartPoint) {
        setStartLineId(null)
      }
      // If there's a start and this line is before it, clear the start
      else if (startLineId) {
        const startLine = lines.find(l => l.id === startLineId)
        if (startLine?.order && line.order < startLine.order) {
          setStartLineId(null)
        }
      }
      setEndLineId(line.id)
    }
    setClickedLineId(null)
  }

  const handleAddLineBelow = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('Add line below clicked for line:', line?.id, 'order:', line?.order)
    if (!line?.order) {
      console.error('Line order is missing:', line)
      return
    }
    onAddLineBelow(line.order)
  }

  // Close buttons when clicking outside or when range selection mode is turned off
  React.useEffect(() => {
    if (!isRangeSelectionMode) {
      setClickedLineId(null)
    }
  }, [isRangeSelectionMode])

  const removeTempLine = () => {
    let tempLineExists = lines?.find(line => line.id == (TEMP_LINE_ID))
    if (tempLineExists) {
      setLines(prev => prev ? prev.filter(line => line.id !== TEMP_LINE_ID) : null)
    }
  }

  const displaySelectedCharacterName = () => {
    // Show loading state while characters are being fetched
    if (!characters) {
      return "Loading..."
    }

    let res = ""

    const meText = "(me)"
    const charIsMe = currCharacter?.is_me === true

    if (currCharacter) {
        res += currCharacter.name
    } if (charIsMe) {
        res += ' ' + meText
    }

    // If no character found but characters are loaded, show placeholder
    if (!res && characters.length > 0) {
      return "No character"
    }

    return res
  }

  // Handle mouse down to track initial position
  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY })
  }

  // Handle mouse up to detect if it was a click (no significant movement)
  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseDownPos && !isDragging) {
      const deltaX = Math.abs(e.clientX - mouseDownPos.x)
      const deltaY = Math.abs(e.clientY - mouseDownPos.y)
      
      // If mouse didn't move much, treat as click
      if (deltaX < 5 && deltaY < 5) {
        handleSetLineToEditMode()
      }
    }
    setMouseDownPos(null)
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: line?.id!, 
    disabled: isDragDisabled || line?.isDeleting || isRangeSelectionMode 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // No transition during drag for instant response
  };

  // Determine if this line is the start or end point
  const isStartPoint = startLineId === line?.id
  const isEndPoint = endLineId === line?.id
  const isClickedLine = clickedLineId === line?.id

  // Calculate if line is within the range using ORDER not ID
  const isInSelectedRange = (() => {
    if (!line?.order || !lines) return false

    // Both start and end are set
    if (startLineId && endLineId) {
      const startLine = lines.find(l => l.id === startLineId)
      const endLine = lines.find(l => l.id === endLineId)

      if (!startLine?.order || !endLine?.order) return false

      const minOrder = Math.min(startLine.order, endLine.order)
      const maxOrder = Math.max(startLine.order, endLine.order)

      return line.order >= minOrder && line.order <= maxOrder
    }

    // Only start is set - everything from start onwards is in range
    if (startLineId && !endLineId) {
      const startLine = lines.find(l => l.id === startLineId)
      if (!startLine?.order) return false
      return line.order >= startLine.order
    }

    // Only end is set - everything up to and including end is in range
    if (!startLineId && endLineId) {
      const endLine = lines.find(l => l.id === endLineId)
      if (!endLine?.order) return false
      return line.order <= endLine.order
    }

    return false
  })()

  // Only show dimming when NOT in selection mode but a range is set (full or partial)
  const isOutsideRange = !isRangeSelectionMode && (startLineId || endLineId) && !isInSelectedRange

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        lineRef.current = node
      }}
      data-line-id={line?.id}
      {...(isRangeSelectionMode ? {} : attributes)}
      {...(isRangeSelectionMode ? {} : listeners)}
      className={`w-full text-center mb-8 px-8 py-6 rounded-xl transition-all duration-300 ease-in-out font-medium border border-transparent relative ${courierPrimeRegular.className} ${
        isDragging ? 'shadow-lg scale-105' : 'shadow-none scale-100'
      } ${
        line?.isDeleting ? 'cursor-not-allowed opacity-60' :
        isCharactersLoading ? 'cursor-not-allowed opacity-60' :
        isRangeSelectionMode ? 'cursor-pointer' :
        isDragDisabled ? 'cursor-pointer' : 'cursor-grab'
      } ${
        isOutsideRange ? 'opacity-50' : ''
      }`}
      style={{
        ...style,
        border: '1px solid transparent',
        // Different backgrounds for different states
        backgroundColor: line?.isDeleting ? 'rgba(200,200,200,0.3)' :
                        isDragging ? 'rgba(255,160,90,0.15)' :
                        (isRangeSelectionMode && isClickedLine) ? 'rgba(59,130,246,0.1)' :
                        'transparent',
        borderColor: line?.isDeleting ? 'rgba(150,150,150,0.4)' :
                    isDragging ? 'rgba(255,160,90,0.3)' :
                    (isRangeSelectionMode && isClickedLine) ? '#3b82f6' :
                    (isRangeSelectionMode && isStartPoint) ? '#86efac' :
                    (isRangeSelectionMode && isEndPoint) ? '#fca5a5' :
                    'transparent',
        borderWidth: (isRangeSelectionMode && (isStartPoint || isEndPoint || isClickedLine)) ? '3px' : '1px',
        boxShadow: (isRangeSelectionMode && isStartPoint) ? '0 0 0 3px rgba(134, 239, 172, 0.3)' :
                   (isRangeSelectionMode && isEndPoint) ? '0 0 0 3px rgba(252, 165, 165, 0.3)' :
                   (isRangeSelectionMode && isClickedLine) ? '0 0 0 3px rgba(59, 130, 246, 0.2)' :
                   'none'
      }}
      onMouseEnter={(e) => {
        if (!isDragging && !isCharactersLoading && !line?.isDeleting && !isRangeSelectionMode && !isDragDisabled) {
          e.currentTarget.style.backgroundColor = 'rgba(255,160,90,0.08)'
          e.currentTarget.style.borderColor = 'rgba(255,160,90,0.2)'
          e.currentTarget.style.borderRadius = '12px'
          setIsHovered(true)
        }
      }}
      onMouseLeave={(e) => {
        // Always reset hover state and styles on mouse leave, regardless of conditions
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
        e.currentTarget.style.borderRadius = '12px'
        setIsHovered(false)
      }}
      onMouseDown={isRangeSelectionMode ? undefined : handleMouseDown}
      onMouseUp={isRangeSelectionMode ? undefined : handleMouseUp}
      onClick={isRangeSelectionMode ? handleRangeSelection : undefined}
    >
      {/* Character Name */}
      <div className={`text-lg uppercase mb-3 transition-opacity duration-300 ease-in-out ${courierPrimeRegular.className}`} style={{ color: '#0a0a0a', letterSpacing: '0.05em' }}>
        {displaySelectedCharacterName()}
      </div>

      {/* Line Text */}
      <div className={`text-lg leading-relaxed whitespace-pre-wrap ${courierPrimeRegular.className}`} style={{ color: '#0a0a0a' }}>
        {line.text}
      </div>

      {/* Range Selection Buttons - Show when line is clicked */}
      {isRangeSelectionMode && isClickedLine && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={handleSetAsStart}
            className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${
              isStartPoint
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
            } ${sunsetSerialMediumFont.className}`}
          >
            {isStartPoint ? 'Clear Start' : 'Set as Start'}
          </button>
          <button
            onClick={handleSetAsEnd}
            className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${
              isEndPoint
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
            } ${sunsetSerialMediumFont.className}`}
          >
            {isEndPoint ? 'Clear End' : 'Set as End'}
          </button>
        </div>
      )}

      {/* Start/End Point Labels - Only show during selection mode */}
      {isRangeSelectionMode && (isStartPoint || isEndPoint) && (
        <div className={`absolute -top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
          isStartPoint
            ? 'bg-green-300 text-green-800 border border-green-400'
            : 'bg-red-300 text-red-800 border border-red-400'
        }`}>
          {isStartPoint ? 'START' : 'END'}
        </div>
      )}

      {/* Selection Mode Indicator - Blue dot logic */}
      {isRangeSelectionMode && (() => {
        if (!line?.order || !lines) return null

        // If no range is set, show dots on all lines
        if (!startLineId && !endLineId) {
          return (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse">
            </div>
          )
        }

        // If both start and end are set, show dots on lines within the range (inclusive)
        if (startLineId && endLineId) {
          const startLine = lines.find(l => l.id === startLineId)
          const endLine = lines.find(l => l.id === endLineId)

          if (startLine?.order && endLine?.order) {
            const minOrder = Math.min(startLine.order, endLine.order)
            const maxOrder = Math.max(startLine.order, endLine.order)

            if (line.order >= minOrder && line.order <= maxOrder) {
              return (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse">
                </div>
              )
            }
          }
        }

        // If only start is set, show dots on start and everything after
        if (startLineId && !endLineId) {
          const startLine = lines.find(l => l.id === startLineId)
          if (startLine?.order && line.order >= startLine.order) {
            return (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse">
              </div>
            )
          }
        }

        // If only end is set, show dots on end and everything before
        if (!startLineId && endLineId) {
          const endLine = lines.find(l => l.id === endLineId)
          if (endLine?.order && line.order <= endLine.order) {
            return (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse">
              </div>
            )
          }
        }

        return null
      })()}

      {/* Deleting State */}
      {line?.isDeleting && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-500 font-medium">deleting</span>
          <svg 
            width="32" 
            height="12" 
            viewBox="0 0 32 12" 
            className="ml-1"
          >
            <circle cx="4" cy="8" r="2" fill="#72a4f2">
              <animate
                attributeName="cy"
                values="8;4;8"
                dur="1.4s"
                repeatCount="indefinite"
                begin="0s"
              />
            </circle>
            <circle cx="14" cy="8" r="2" fill="#ffa05a">
              <animate
                attributeName="cy"
                values="8;4;8"
                dur="1.4s"
                repeatCount="indefinite"
                begin="0.2s"
              />
            </circle>
            <circle cx="24" cy="8" r="2" fill="#FFD96E">
              <animate
                attributeName="cy"
                values="8;4;8"
                dur="1.4s"
                repeatCount="indefinite"
                begin="0.4s"
              />
            </circle>
          </svg>
        </div>
      )}

      {/* Add Line Below Button - Only show on hover and when not in special states */}
      {isHovered && !line?.isDeleting && !isCharactersLoading && !isRangeSelectionMode && !isDragDisabled && (
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 animate-in fade-in duration-300 ease-in-out"
          style={{
            bottom: '-16px', // Lowered even more
            zIndex: 30
          }}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <button
            onClick={handleAddLineBelow}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            className="px-3 py-1 rounded-full font-bold text-xs transition-all duration-300 ease-in-out flex items-center justify-center gap-2 text-white hover:text-white group cursor-pointer"
            style={{
              backgroundColor: '#ffa05a',
              border: '2px solid #ffa05a',
              boxShadow: '0 4px 12px rgba(255, 160, 90, 0.3)',
              zIndex: 40
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ff8a3a'
              e.currentTarget.style.borderColor = '#ff8a3a'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 138, 58, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffa05a'
              e.currentTarget.style.borderColor = '#ffa05a'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 160, 90, 0.3)'
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="text-white text-xs group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-bold">Add line below</span>
          </button>
        </div>
      )}
    </div>
  );
  
}

export default SavedLine