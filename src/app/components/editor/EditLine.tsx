"use client"
import React, {useState, useRef} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faScissors, faHand, faCircleCheck, faXmark, faPersonRunning, faTrashCan, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import ButtonLink from '../ui/ButtonLink'
import { DraftLine, Character, LineBeingEditedData } from '@/app/types';
import clsx from 'clsx';

type Props = {
    line: DraftLine | null,
    characters: Character[] | null,
    lineBeingEditedData: LineBeingEditedData,
    newLineOrder: number,
    setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>;
    closeEditLine: () => void,
    openCharacterDropdown: (ref: React.RefObject<HTMLDivElement | null>) => void,
    setLineBeingEditedData: React.Dispatch<React.SetStateAction<LineBeingEditedData>>;
}

const EditLine = ({line, characters, lineBeingEditedData, newLineOrder, setLines, closeEditLine, openCharacterDropdown, setLineBeingEditedData}: Props) => {

    console.log("lineBeingEditedData")
    console.log(lineBeingEditedData)
    
    // Unsetting state to "empty"", for clarity
    const LINE_BEING_EDITED_EMPTY: LineBeingEditedData = {
        voice: null,
        character: null,
        text: null,
        order: null
    }
    // Newly added line (line is placed at end)
    const LINE_BEING_EDITED_NEW: LineBeingEditedData = {
        voice: null,
        character: null,
        text: null,
        order: newLineOrder
    }
    const TEMP_LINE_ID = -999
    const isNewLine = line?.id === TEMP_LINE_ID
    const sceneId = line?.scene_id
    const lineId = line?.id
    const {character, text} = lineBeingEditedData
    
    const [isLoading, setIsLoading] = useState<boolean>(false)  

    const dropdownBtnRef = useRef<HTMLDivElement | null>(null);

    // Save line - {text, order, scene_id, character_id}
    const handleSaveLine = async () => {

        const text = lineBeingEditedData.text
        const characterId = lineBeingEditedData.character?.id
        const voiceId = lineBeingEditedData.voice?.voice_id
        const order = lineBeingEditedData.order

        const charIsMe = character?.is_me

        if (isNewLine) {
            var res = await fetch(`/api/private/scenes/${sceneId}/lines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...(charIsMe === false ? {voiceId} : {}), // Not a column in "lines". Used to create tts
                    text,
                    characterId,
                    order
                })
            })
        } else {
            var res = await fetch(`/api/private/scenes/${sceneId}/lines/${line?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...(charIsMe === false ? {voiceId} : {}),
                    text,
                    order,
                    character_id: characterId,
                    scene_id: sceneId
                })
            })
        }

        if (res.ok) {
            //  POST - add line to db
            if (isNewLine) {
                const result = await res.json()
                const insertedLine = result.insertedLine[0]
                setLines(prev => prev ? [...prev, insertedLine]  : [insertedLine])
                closeEditLine()
            // PATCH - update line in db
            } else {
                const result = await res.json()
                console.log(result)
                const {id, updates} = result
                setLines(lines => {
                    if (!lines) return null
                    return lines.map(line => {
                        return line?.id == lineId ?
                        {id: id, ...updates} : line
                    })
                })
                closeEditLine()
            }
        }
    }

    const handleChangeLineText = (text: string) => {
        setLineBeingEditedData(prev => ({...prev, text: text}))
    }

    const handleDeleteLine = async () => {
        
        // Removing unsaved line
        if (lineId == TEMP_LINE_ID) {
            closeEditLine()
        // Remove "live" line
        } else {
            const res = await fetch(`/api/private/scenes/${sceneId}/lines/${lineId}`,{
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: lineId
                })
            })
    
            if (res.ok) {  
                setLines(prev => {
                    if (!prev) return null
                    return prev?.filter(line => line.id != lineId)
                })
                setLineBeingEditedData(LINE_BEING_EDITED_EMPTY)
            }
        }
    }

    const displaySelectedCharacterName = () => {

        let res = ""

        const meText = "(me)"
        const charIsMe = character?.is_me === true

        if (character) {
            res += character.name
            if (charIsMe) {
                res += ' ' + meText
                console.log(res)
            }
        } else {
            res = "Select Character"
            console.log(res)
        }
        return res
    }

    return (
        <div className="bg-[#fffef5] px-6 py-6 rounded-2xl shadow-[0_0_3px_1px_rgba(0,0,0,0.05)] border border-gray-200 mb-10 w-full max-w-3xl mx-auto">
          {/* Top Controls */}
          <div className="flex items-center justify-start mb-5">
            <div
              className="relative w-52 h-9 bg-white rounded-full border border-gray-300 pl-4 pr-10 py-1.5 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              ref={dropdownBtnRef}
              onClick={() => openCharacterDropdown(dropdownBtnRef)}
            >
              <span>{displaySelectedCharacterName()}</span>
              <span className="w-6 h-6 flex justify-center items-center absolute top-1/2 -translate-y-1/2 right-2">
                <FontAwesomeIcon icon={faCaretDown} />
              </span>
            </div>
      
            <button className="ml-4" aria-label="Record">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center hover:opacity-85 transition">
                <FontAwesomeIcon icon={faMicrophone} color="#fff" />
              </div>
            </button>
      
            <button
              className="ml-auto w-9 h-9 rounded-md hover:bg-gray-200 transition"
              onClick={closeEditLine}
              aria-label="Cancel edit"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
      
          {/* Line Text */}
          <textarea
            placeholder="Type the line and choose a voice (optional). Recording audio enhances the AI voice."
            className="bg-white w-full border border-gray-200 rounded-md px-4 py-3 text-base font-courier font-semibold text-black resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 transition mb-4"
            onChange={(e) => handleChangeLineText(e.target.value)}
            value={text || ""}
            rows={5}
          />
      
          {/* Action Row */}
          <div
            className={clsx(
              "flex items-center justify-between transition-all duration-200",
              lineBeingEditedData.character ? "h-10" : "h-0"
            )}
          >
            {/* Styled Icon Buttons */}
            <div
              className={clsx(
                "flex items-center gap-4 text-sm transition-all duration-200",
                lineBeingEditedData.character
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0 pointer-events-none"
              )}
            >
              {[faScissors, faPersonRunning, faHand].map((icon, i) => (
                <button
                  key={i}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#ffeeda] text-[#3f3f3f] shadow-[0_0_2px_1px_rgba(0,0,0,0.04)] hover:shadow-md transition-all"
                >
                  <FontAwesomeIcon icon={icon} />
                </button>
              ))}
              <div className="h-6 w-px bg-[#e0cfc3] mx-3" />
              <button
                onClick={handleDeleteLine}
                aria-label="Delete line"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#ffeaea] text-red-500 shadow-[0_0_2px_1px_rgba(0,0,0,0.04)] hover:shadow-md transition-all"
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
      
            {/* Save Button */}
            <button
              onClick={handleSaveLine}
              className={clsx(
                "transition-opacity duration-100 ml-4",
                lineBeingEditedData.character
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              )}
            >
              <ButtonLink
                icon={faCircleCheck}
                text={isLoading ? "Saving..." : "Save"}
                bgColor={isLoading ? "#ccc" : undefined}
                className="px-5 py-2 text-md"
              />
            </button>
          </div>
        </div>
      );      
      
}

export default EditLine