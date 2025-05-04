"use client"
import React, { useEffect, useRef, useState } from 'react'
import { faChessKing, faPlus } from "@fortawesome/free-solid-svg-icons";
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

type Props = {
  lineItems: DraftLine[] | null,
  scrollRef: React.RefObject<HTMLElement | null>,
  sceneId: number
}

const LineList = ({lineItems, scrollRef, sceneId}: Props) => {

  const sortedLines = lineItems?.slice().sort((a, b) => {
    if (!a || !b || a.order == null || b.order == null) return 0;
    return a.order - b.order;
  });

  const [lines, setLines] = useState<DraftLine[] | null>(sortedLines || null)
  const [lineBeingEdited, setLineBeingEdited] = useState<DraftLine | null>(null)
  const [lineBeingEditedData, setLineBeingEditedData] = useState<LineBeingEditedData>({voice: null, character: null, text: null, order: null}) // Tracks changes for line that is currently being edited
  const [characters, setCharacters] = useState<Character[] | null>(null)
  const [isCharDropdownOpen, setIsCharDropdownOpen] = useState<boolean>(false)
  const [isCreateCharModalOpen, setIsCreateCharModalOpen] = useState<boolean>(false)
  const [dropdownPos, setDropdownPos] = useState<{top: number, right: number} | null>(null) // Should this be global for all dropdowns?
  const [shouldScroll, setShouldScroll] = useState<boolean>(false)

  const TEMP_LINE_ID = -999
  const voices = useVoicesStore(s => s.voices)

  const highestLineOrder = lines?.reduce((max, line) => {
    const lineOrder = line.order ? line.order : -1
    return lineOrder > max ? lineOrder : max
  }, -Infinity)
  const newLineOrder = highestLineOrder ? highestLineOrder + 1 : 1
  console.log(newLineOrder)
  // Unsetting state to "empty"", for clarity
  const LINE_BEING_EDITED_EMPTY: LineBeingEditedData = {
    voice: null,
    character: null,
    text: null,
    order: null
  }
  // Newly added line (line is placed at end)
  const LINE_BEING_EDITED_NEW: LineBeingEditedData = {
    voice:  null,
    character: null,
    text: null,
    order: newLineOrder
  }

  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom(scrollRef)
    }
  }, [shouldScroll])

  console.log(shouldScroll)

  /* Characters */

  // Fetching characters
  useEffect(() => {
    const fetchSceneCharacters = async () => {
      try {
        const res = await fetch(`/api/private/scenes/${sceneId}/characters`)
        const charactersJson = await res.json()

        setCharacters(charactersJson)
      } catch (err) {
        console.error("Failed to catch characters for scene", err)
      }
    }
    fetchSceneCharacters()
  }, [sceneId])

  /* Editing line */

  // Opening dropdown for selecting characters
  const openCharacterDropdown = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) {
      throw new Error("Dropdown button doesn't exist, but should")
    }

    const dropdownBtn = ref.current?.getBoundingClientRect()
    setDropdownPos({
      top: dropdownBtn.top + window.scrollY + 40,
      right: window.innerWidth - dropdownBtn.right
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
        setLineBeingEditedData(prev => ({...prev, character: null}))
        setIsCreateCharModalOpen(true)
        setIsCharDropdownOpen(false)
      },
      className: "hover:bg-gray-200 px-2 py-2 transition-colors duration-200 ease-in-out"
    },
    ...characters.map(char => {
      return {
        label: char.name,
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
    if (lines && !lines.find(l => l.text == null)) {
      const newLine: DraftLine = {
        id: TEMP_LINE_ID,
        character_id: null,
        order: newLineOrderNumber,
        scene_id: sceneId,
        text: null
      }
      setLineBeingEdited(newLine)
      setLineBeingEditedData(LINE_BEING_EDITED_NEW)
      setLines(prev => prev == null ? [newLine] : [...prev, newLine])
      setShouldScroll(true)
    } else {
      console.log("Can only add one new line at a time")
    }
  }

  const closeEditLine = () => {
    // Remove temp line from lines array. Line isn't in db so no need to hit delete endpoint
    if (lines?.find(l => Number(l.id) == TEMP_LINE_ID)) {
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
      lines?.length ?
      lines?.map(line => {
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
          lines={lines} 
          characters={characters} 
          setLines={setLines}
          setLineBeingEdited={setLineBeingEdited} 
          setLineBeingEditedData={setLineBeingEditedData} />
      }) :
      <div>
        <div className='font-semibold text-xl text-center font-pacifico mb-5'>Click the button below to add lines</div>
        <div className='relative min-w-50 min-h-50 mb-10'>
          <Image
            src="/add-line.png"
            alt="add line"
            fill
            style={{objectFit: "contain"}}
          />
        </div>
      </div>
      
      }
      <button 
        className="mt-5 px-5 py-2 text-lg font-semibold text-black bg-transparent border-3 border-black rounded-full flex items-center hover:bg-black hover:text-white transition-colors duration-200 ease-in-out"
        onClick={handleAddLine}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span className="ml-2">Add Line</span>
      </button>

      <PlaySceneButtonsWrapper />

      {isCharDropdownOpen && <Overlay closeDropdown={closeCharDropdown}/>}
      {isCharDropdownOpen && <Dropdown dropdownData={charsDropdownData} dropdownPos={dropdownPos} className={"w-40 z-20"} closeDropdown={closeCharDropdown}/>}
      {isCreateCharModalOpen && <ModalCreateCharacter setCharacters={setCharacters} setIsCreateCharModalOpen={setIsCreateCharModalOpen} sceneId={sceneId} setLineBeingEditedData={setLineBeingEditedData} lineBeingEditedData={lineBeingEditedData} />}
    </>
  )
}

export default LineList