"use client"
import React, { useEffect, useState } from 'react'
import SavedLine from './SavedLine'
import NewLine from './EditLine'
import EditLine from './EditLine'
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

type Props = {
  lineItems: Line[] | null,
  sceneId: number
}

const LineList = ({lineItems, sceneId}: Props) => {

  const [lines, setLines] = useState<DraftLine[] | null>(lineItems)
  const [lineBeingEdited, setLineBeingEdited] = useState<DraftLine | null>(null)
  const [characters, setCharacters] = useState<Character | null>()

  // Fetch characters fot scene
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
          return line.id == lineBeingEdited?.id ? <EditLine line={line} characters={characters} /> : <SavedLine line={line} />
        })
      }
      <button 
        className="mt-5 px-5 py-2 text-xl font-semibold text-blue-950 bg-transparent border-3 border-blue-950 rounded-full flex items-center hover:bg-blue-950 hover:text-white transition-colors duration-200 ease-in-out"
        onClick={handleAddLine}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span className="ml-2">Add Line</span>
      </button>
    </>
  )
}

export default LineList