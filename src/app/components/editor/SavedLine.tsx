import React from 'react'
import { Character, DraftLine, LineBeingEditedData } from '@/app/types';
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import localFont from "next/font/local";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const courierPrimeRegular = localFont({
    src: "../../../../public/fonts/courierPrimeRegular.ttf",
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
}

const SavedLine = ({line, lines, characters, setLines, setLineBeingEdited, setLineBeingEditedData, setShouldScroll, setOriginalCharForOpenedLine, index, isDragDisabled}: Props) => {

  const TEMP_LINE_ID = -999
  const currCharacter = characters?.find(char => char.id === line?.character_id) ||  null
  const voices = useVoicesStore((s) => s.voices)
  
  // Track mouse position for click vs drag detection
  const [mouseDownPos, setMouseDownPos] = React.useState<{x: number, y: number} | null>(null)

  if (line == null) return

  const handleSetLineToEditMode = () => {
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
    disabled: isDragDisabled 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition, // No transition during drag for instant response
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`w-full text-center mb-8 px-8 py-6 cursor-pointer rounded-xl transition-all duration-300 ease-in-out font-medium border border-transparent ${courierPrimeRegular.className} ${
        isDragging ? 'shadow-lg scale-105' : 'shadow-none scale-100'
      } ${
        isDragDisabled ? 'cursor-default' : 'cursor-grab'
      }`}
      style={{
        ...style,
        border: '1px solid transparent',
        // Orange hover color during drag - no transparency
        backgroundColor: isDragging ? 'rgba(255,160,90,0.15)' : 'transparent',
        borderColor: isDragging ? 'rgba(255,160,90,0.3)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isDragDisabled && !isDragging) {
          e.currentTarget.style.backgroundColor = 'rgba(255,160,90,0.08)'
          e.currentTarget.style.borderColor = 'rgba(255,160,90,0.2)'
          e.currentTarget.style.borderRadius = '12px'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragDisabled && !isDragging) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.borderColor = 'transparent'
          e.currentTarget.style.borderRadius = '12px'
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Character Name */}
      <div className="text-sm tracking-widest uppercase text-gray-600 mb-3 font-semibold transition-opacity duration-300 ease-in-out">
        {displaySelectedCharacterName()}
      </div>
  
      {/* Line Text */}
      <div className="text-lg leading-relaxed text-gray-900 whitespace-pre-wrap">
        {line.text}
      </div>
    </div>
  );
  
}

export default SavedLine