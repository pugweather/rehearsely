"use client"
import React, {useState, useRef} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faScissors, faHand, faCircleCheck, faXmark, faPersonRunning, faTrash, faCaretDown } from "@fortawesome/free-solid-svg-icons";
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
        const order = lineBeingEditedData.order

        if (isNewLine) {
            var res = await fetch(`/api/private/scenes/${sceneId}/lines`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text,
                    order,
                    characterId,
                    sceneId
                })
            })
        } else {
            var res = await fetch(`/api/private/scenes/${sceneId}/lines/${line?.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
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
        } if (charIsMe) {
            res += ' ' + meText
        } else {
            res = "Select Character"
        }
        return res
    }

    return (
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm w-full border border-gray-200 mb-12.5">
            <div className="flex items-center justify-start mb-3">
                <div 
                    className="relative w-40 h-8.5 rounded-full border border-gray-300 pl-3 pr-10 py-1.5 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    ref={dropdownBtnRef}
                    onClick={() => openCharacterDropdown(dropdownBtnRef)}>
                    <span>{displaySelectedCharacterName()}</span>
                    <span className='w-6 h-6 flex justify-center items-center absolute top-1/2 -translate-y-1/2 right-2'><FontAwesomeIcon icon={faCaretDown} /></span>
                </div>
                <button className="text-black ml-5">
                    <div className='w-8 h-8 rounded-full flex justify-center items-center bg-black hover:opacity-85 transition-colors duration-200 ease-in-out'>
                        <FontAwesomeIcon color='#fff' icon={faMicrophone} />
                    </div>
                </button>
                <button className='text-xl ml-auto w-8 h-8 rounded-md hover:bg-gray-200' onClick={closeEditLine}>
                    <FontAwesomeIcon icon={faXmark}/>
                </button>
            </div>

            <textarea
                placeholder="Type line here or click microphone to record audio..."
                className="bg-white w-full border border-gray-100 rounded-md px-3 py-2 text-md text-black resize-none mb-3 font-courier font-semibold focus:outline-none focus:ring-0"
                onChange={(e) => handleChangeLineText(e.target.value)}
                value={text ? text : ''}
                rows={4}
            />
            <div className={clsx("flex items-center justify-between transition-all duration-200 ease-in-out transform",
                    lineBeingEditedData.character ? "h-10" : "h-0"
            )}>
                <div className={clsx(
                        "flex items-center gap-5 text-gray-500 text-sm h-10 transition-all duration-200 ease-in-out transform",
                    lineBeingEditedData.character ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0 pointer-events-none"
                )}>
                    <button className='px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-200'>
                        <FontAwesomeIcon icon={faScissors} />
                    </button>
                    <button className='px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-200'>
                        <FontAwesomeIcon icon={faPersonRunning} />
                    </button>
                    <button className='px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-200'>
                        <FontAwesomeIcon icon={faHand} />
                    </button>
                    <div className='h-full w-0.25 bg-gray-300 mx-2'></div>
                    <button className='px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-200'  onClick={handleDeleteLine}>
                        <FontAwesomeIcon icon={faTrash} color='#da2a2a' />
                    </button>
                </div>
                <button 
                    onClick={handleSaveLine}
                    className={clsx(
                        "flex items-center gap-5 text-gray-500 text-sm h-10 transition-all duration-100 ease-in-out transform",
                        lineBeingEditedData.character ? "opacity-100" : "opacity-0"
                )}>
                    <ButtonLink 
                        icon={faCircleCheck}
                        text={isLoading ?  'Saving Changes...' : 'Save'}
                        bgColor={isLoading ? "#ccc" : undefined}
                    />
                </button>
            </div>
        </div>
    )
}

export default EditLine