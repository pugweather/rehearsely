"use client"
import React, { useEffect, useState } from 'react'
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SavedLine from './SavedLine'
import NewLine from './EditLine'
import EditLine from './EditLine'
import Dropdown from '../ui/Dropdown'
import Overlay from '../ui/Overlay';

type Line = {
  character_id: number,
  id: number,
  order: number,
  scene_id: number,
  text: string | null
}

// For when a new line that is added
type DraftLine = {
  character_id: number | null,
  id: number | null,
  order: number | null,
  scene_id: number | null,
  text: string | null,
  isNew?: boolean
};

type Character = {
  id: number,
  name: string,
  scene_id: number
}

type DropdownData = {
  label: string,
  onClick: () => void,
  className?: string
};

type Props = {
  lineItems: Line[] | null,
  sceneId: number
}

const LineList = ({lineItems, sceneId}: Props) => {

  const [lines, setLines] = useState<DraftLine[] | null>(lineItems)
  const [lineBeingEdited, setLineBeingEdited] = useState<DraftLine | null>(null)
  const [characters, setCharacters] = useState<Character[] | null>(null)
  const [isCharDropdownOpen, setIsCharDropdownOpen] = useState<boolean>(false)
  const [dropdownPos, setDropdownPos] = useState<{top: number, right: number} | null>(null) // Should this be global for all dropdowns?

  console.log(lines)

  /* Characters */

  // Fetching characters
  useEffect(() => {
    const fetchSceneCharacters = async () => {
      try {
        const res = await fetch(`/api/private/scenes/${sceneId}/characters`)
        const characters = await res.json()
        setCharacters(characters)
      } catch(err) {
        console.error("Failed to catch characters for scene", err)
      }
    }
    fetchSceneCharacters()
  }, [sceneId])

  // Opening dropdown for selecting characters
  const openCharacterDropdown = (ref: React.RefObject<HTMLDivElement | null>) => {
    console.log(ref)
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

  // Close character dropdown
  const closeCharDropdown = () => {
    setIsCharDropdownOpen(false)
    setDropdownPos(null)
  }

  // Closing character dropdown (by clicking ovelar, which is ANY area outside of the dropdown)
  const closeDropdown = () => {
    setIsCharDropdownOpen(false)
    setDropdownPos(null)
  }

  // Options for our the scene card dropdowns
  const charsDropdownData: DropdownData[] | undefined = characters?.map(char => {
    return {
      label: char.name,
      onClick: function() {
        if (char) {
          setIsCharDropdownOpen(true)
        }
      },
      className: "hover:bg-gray-200 px-2 py-2 transition-colors duration-200 ease-in-out"
    }
  })

  /* Lines */ 

  // Adding lines to scene
  const handleAddLine = () => {
    if (lines && !lines.find(l => l.text == null)) {
      const newLine: DraftLine = {
        character_id: null,
        id: null,
        order: null,
        scene_id: null,
        text: null
      }
      setLines(prev => prev == null ? [newLine] : [...prev, newLine])
    } else {
      console.log("Can only add one new line at a time.")
    }
  }

  return (
    <>
      {
        lines?.map(line => {
          return line.id == lineBeingEdited?.id ? <EditLine line={line} characters={characters} openCharacterDropdown={openCharacterDropdown}/> : <SavedLine line={line} />
        })
      }
      <button 
        className="mt-5 px-5 py-2 text-xl font-semibold text-blue-950 bg-transparent border-3 border-blue-950 rounded-full flex items-center hover:bg-blue-950 hover:text-white transition-colors duration-200 ease-in-out"
        onClick={handleAddLine}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span className="ml-2">Add Line</span>
      </button>

      {isCharDropdownOpen && <Overlay closeDropdown={closeCharDropdown}/>}
      {isCharDropdownOpen && <Dropdown dropdownData={charsDropdownData} dropdownPos={dropdownPos} className={"w-40"} closeDropdown={closeCharDropdown}/>}
    </>
  )
}

export default LineList