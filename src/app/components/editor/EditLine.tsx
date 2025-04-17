"use client"
import React, {useState, useRef} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faScissors, faHand, faCircleCheck, faXmark, faPersonRunning, faTrash } from "@fortawesome/free-solid-svg-icons";
import ButtonLink from '../ui/ButtonLink'

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
};

type Props = {
    line: DraftLine | null,
    characters: Character[] | null,
    closeEditLine: () => void,
    openCharacterDropdown: (ref: React.RefObject<HTMLDivElement | null>) => void
}

const EditLine = ({line, characters, closeEditLine, openCharacterDropdown}: Props) => {

    console.log(`characters: ${characters}`)

    const [isLoading, setIsLoading] = useState<boolean>(false)  

    const dropdownBtnRef = useRef<HTMLDivElement | null>(null);

    const handleSaveLine = () => {
        console.log("save line")
    }

    return (
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm w-full border border-gray-200 mb-12.5">
            <div className="flex items-center justify-start mb-3">
                <div 
                    className="relative w-40 h-8.5 rounded-full border border-gray-300 pl-3 pr-10 py-1.5 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    ref={dropdownBtnRef}
                    onClick={() => openCharacterDropdown(dropdownBtnRef)}>
                    <span>Hello</span>
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
                rows={4}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5 text-gray-500 text-sm h-10">
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
                    <button className='px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-200'>
                        <FontAwesomeIcon icon={faTrash} color='#da2a2a' />
                    </button>
                </div>
                <button onClick={handleSaveLine}>
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