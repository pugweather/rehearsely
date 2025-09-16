"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { faChessKing, faPlus, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SavedLine from './SavedLine'
import EditLine from './EditLine'
import Dropdown from '../ui/Dropdown'
import Overlay from '../ui/Overlay';
import ModalCreateCharacter from './ModalCreateCharacter';
import PlaySceneButtonsWrapper from './PlaySceneButtonsWrapper';
import { Line, DraftLine, LineBeingEditedData, Character, DropdownData } from '@/app/types';
import Image from 'next/image';
import { scrollToBottom } from '@/app/utils/utils';
import { useVoicesStore } from '@/app/stores/useVoicesStores';
import { useCharacters } from '@/app/context/charactersContext';
0
type Props = {
  lineItems: DraftLine[] | null,
  scrollRef: React.RefObject<HTMLElement | null>,
  sceneId: number,
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>
}

const LineList = ({lineItems, scrollRef, sceneId, setLines}: Props) => {

  // const sortedLines = lineItems?.slice().sort((a, b) => {
  //   if (!a || !b || a.order == null || b.order == null) return 0;
  //   return a.order - b.order;
  // });

  // const [lines, setLines] = useState<DraftLine[] | null>(sortedLines || null)
  const [lineBeingEdited, setLineBeingEdited] = useState<DraftLine | null>(null)
  const [lineBeingEditedData, setLineBeingEditedData] = useState<LineBeingEditedData>({voice: null, character: null, text: null, speed: 1, delay: 1, order: null}) // Tracks changes for line that is currently being edited
  const {characters, setCharacters} = useCharacters()
  const [originalCharForOpenedLine, setOriginalCharForOpenedLine] = useState<Character | null>(null) // When a line is opened, we track the original
  const [isCharDropdownOpen, setIsCharDropdownOpen] = useState<boolean>(false)
  const [isCreateCharModalOpen, setIsCreateCharModalOpen] = useState<boolean>(false)
  const [dropdownPos, setDropdownPos] = useState<{top: number, right: number} | null>(null) // Should this be global for all dropdowns?
  const [shouldScroll, setShouldScroll] = useState<boolean>(false)

  const TEMP_LINE_ID = -999
  const voices = useVoicesStore(s => s.voices)

  const highestLineOrder = lineItems?.reduce((max, line) => {
    const lineOrder = line.order ? line.order : -1
    return lineOrder > max ? lineOrder : max
  }, -Infinity)
  const newLineOrder = highestLineOrder && Number.isFinite(highestLineOrder) ? highestLineOrder + 1 : 1
  // Unsetting state to "empty"", for clarity
  const LINE_BEING_EDITED_EMPTY: LineBeingEditedData = {
    voice: null,
    character: null,
    text: null,
    speed: 1,
    delay: 1,
    order: null
  }
  // Newly added line (line is placed at end)
  const LINE_BEING_EDITED_NEW: LineBeingEditedData = {
    voice:  null,
    character: null,
    text: null,
    speed: 1,
    delay: 1,
    order: newLineOrder
  }

  const scrollToBottom = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }

  /* Characters */

  // Handle scrolling to bottom when new line is added
  useEffect(() => {
    if (shouldScroll) {
      // 30ms for some extra safety. want to make sure line is added before scrolling
      setTimeout(() => {
        scrollToBottom(scrollRef)
        setShouldScroll(false)
      }, 10)
    }
  }, [shouldScroll])

  /* Editing line */

  // Opening dropdown for selecting characters
  const openCharacterDropdown = (ref: React.RefObject<HTMLDivElement | null>) => {

    if (!ref.current) {
      throw new Error("Dropdown button doesn't exist, but should")
    }

    const dropdownRef = ref?.current

    const MAX_HEIGHT_OF_DROPDOWN = 250
    const DROPDOWN_OFFSET = 40 
    const SAFETY_PADDING = 10

    const containerBottom = scrollRef.current?.getBoundingClientRect().bottom;
    const buttonBottom = dropdownRef.getBoundingClientRect().bottom;
    const distanceFromBottomOfContainer = containerBottom ? containerBottom - buttonBottom : 0
    const showDropdownBelow = distanceFromBottomOfContainer > MAX_HEIGHT_OF_DROPDOWN
    
    const top = showDropdownBelow
      ? dropdownRef.getBoundingClientRect().top + window.scrollY + DROPDOWN_OFFSET
      : dropdownRef.getBoundingClientRect().top + window.scrollY - MAX_HEIGHT_OF_DROPDOWN + SAFETY_PADDING;

    setDropdownPos({
      top: top,
      right: window.innerWidth - dropdownRef.getBoundingClientRect().right
    })

    setIsCharDropdownOpen(true)
  }

  const closeCharDropdown = () => {
    setIsCharDropdownOpen(false)
    setDropdownPos(null)
  }

  // Character dropdown data {label, onClick, className (optional)}
  const charsDropdownData: DropdownData[] | undefined = characters ? 
  [
    {
      label: "+ New Character",
      onClick: function() {
        let maxCharsForScene = 5
        if (characters.length < maxCharsForScene) {
          setLineBeingEditedData(prev => ({...prev, character: null}))
          setIsCreateCharModalOpen(true)
          setIsCharDropdownOpen(false)
        }
      },
      className: "hover:bg-gray-200 px-2 py-2 transition-colors duration-200 ease-in-out"
    },
    ...characters.map(char => {
      const charName = char.is_me ? `${char.name} (me)` : char.name
      return {
        label: charName,
        onClick: function() {
          if (char) {
            const voice = voices?.find(v => v.voice_id === char.voice_id) || null
            setLineBeingEditedData(prev => ({...prev, character: char, voice: voice}))
            setIsCharDropdownOpen(false)
          }
        },
        className: "hover:bg-gray-200 px-2 py-2 transition-colors duration-200 ease-in-out"
      } 
    })
  ] : undefined

  /* Lines */ 

  // Adding lines to scene
  const handleAddLine = () => {
    const newLineOrderNumber = lineItems ? lineItems.length : 1
    // Add temp line with negative id to avoid possibl collisions
    if (lineItems && !lineItems.find(l => l.text == null)) {
      const newLine: DraftLine = {
        id: TEMP_LINE_ID,
        character_id: null,
        order: newLineOrderNumber,
        scene_id: sceneId,
        text: null,
        speed: 1,
        delay: 1,
        audio_url: undefined
      }
      setLineBeingEdited(newLine)
      setLineBeingEditedData(LINE_BEING_EDITED_NEW)
      setLines(prev => prev == null ? [newLine] : [...prev, newLine])
      setOriginalCharForOpenedLine(null)
      setShouldScroll(true)
    } else {
      console.log("Can only add one new line at a time")
    }
  }

  const closeEditLine = () => {
    // Remove temp line from lines array. Line isn't in db so no need to hit delete endpoint
    if (lineItems?.find(l => Number(l.id) == TEMP_LINE_ID)) {
      setLines(prev => {
        if (!prev) return null
        return prev.filter(l => l.id != TEMP_LINE_ID)
      })
    }
    // Also reset data for line being edited
    setLineBeingEditedData(LINE_BEING_EDITED_EMPTY)
    setLineBeingEdited(null) // TODO: we'll keep this for now. Maybe we can put all data into lineBeingEditedData....
  }

  return (
    <>
      { 
      lineItems?.map(line => {
        return line.id == lineBeingEdited?.id ? 
        <EditLine 
          key={line.id}
          line={line} 
          characters={characters} 
          lineBeingEditedData={lineBeingEditedData}
          newLineOrder={newLineOrder}
          setLines={setLines}
          setLineBeingEditedData={setLineBeingEditedData}
          openCharacterDropdown={openCharacterDropdown}
          closeEditLine={closeEditLine}
          />
          : 
        <SavedLine 
          key={line.id}
          line={line} 
          lines={lineItems} 
          characters={characters} 
          setLines={setLines}
          setLineBeingEdited={setLineBeingEdited} 
          setLineBeingEditedData={setLineBeingEditedData} 
          setShouldScroll={setShouldScroll}
          setOriginalCharForOpenedLine={setOriginalCharForOpenedLine}
          />
      }) 
      // <div>
      //   <div className='font-semibold text-xl text-center font-pacifico mb-5'>Click the button below to add lines</div>
      //   <div className='relative min-w-50 min-h-50 mb-10'>
      //     <Image
      //       src="/add-line.png"
      //       alt="add line"
      //       fill
      //       style={{objectFit: "contain"}}
      //     />
      //   </div>
      // </div>
      
      }
      <button 
        className="mt-5 px-5 py-2 text-lg font-semibold text-black bg-transparent border-3 border-black rounded-full flex items-center hover:bg-black hover:text-white transition-colors duration-200 ease-in-out"
        onClick={handleAddLine}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span className="ml-2">Add Line</span>
      </button>

      {isCharDropdownOpen && <Overlay closeDropdown={closeCharDropdown}/>}
      {isCharDropdownOpen && <Dropdown dropdownData={charsDropdownData} dropdownPos={dropdownPos} className={"w-50 z-20 px-1 py-1.5 border-b border-b-gray-100 max-h-[275px]"} closeDropdown={closeCharDropdown}/>}
      {isCreateCharModalOpen && <ModalCreateCharacter originalCharForOpenedLine={originalCharForOpenedLine} setIsCreateCharModalOpen={setIsCreateCharModalOpen} sceneId={sceneId} setLineBeingEditedData={setLineBeingEditedData} lineBeingEditedData={lineBeingEditedData} />}
    </>
  )
}

export default LineList