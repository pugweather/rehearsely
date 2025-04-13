"use client"
import React, {useState} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faScissors, faHand, faCircleCheck, faXmark, faPersonRunning, faTrash } from "@fortawesome/free-solid-svg-icons";
import ButtonLink from '../ui/ButtonLink'

const NewLine = () => {

    const [isLoading, setIsLoading] = useState<boolean>(false)  

    const handleSaveLine = () => {

    }

    return (
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm w-full border border-gray-200 mb-12.5">
            <div className="flex items-center justify-start mb-3">
                <div className="rounded-xl border border-gray-300 pl-3 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <button>Select Character</button>
                    {/* Character list */}
                </div>
                <button className="text-blue-950 ml-5">
                    <div className='w-8 h-8 rounded-full flex justify-center items-center bg-blue-950'>
                        <FontAwesomeIcon color='#fff' icon={faMicrophone} />
                    </div>
                </button>
                <button className='text-xl ml-auto w-8 h-8 rounded-md hover:bg-gray-200'>
                    <FontAwesomeIcon icon={faXmark}/>
                </button>
            </div>

            <textarea
                placeholder="Type line here or click microphone to record audio..."
                className="bg-white w-full border border-gray-100 rounded-md px-3 py-2 text-sm text-gray-800 resize-none mb-3 focus:outline-none focus:ring-0"
                rows={4}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5 text-gray-500 text-sm h-10">
                    <button className='px-3 py-1.5 rounded-2xl border border-gray-200 hover:bg-gray-200'>
                        <FontAwesomeIcon icon={faScissors} />
                    </button>
                    <button className='px-3 py-1.5 rounded-2xl border border-gray-200 hover:bg-gray-200'>
                        <FontAwesomeIcon icon={faPersonRunning} />
                    </button>
                    <button className='px-3 py-1.5 rounded-2xl border border-gray-200 hover:bg-gray-200'>
                        <FontAwesomeIcon icon={faHand} />
                    </button>
                    <div className='h-full w-0.25 bg-gray-300 mx-2'></div>
                    <button className='px-3 py-1.5 rounded-2xl border border-gray-200 hover:bg-gray-200'>
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

export default NewLine