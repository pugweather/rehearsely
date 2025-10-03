"use client"
import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '../layout/Navbar'
import PlayerLineList from './PlayerLineList'
import PlaySceneButtonsWrapper from '../editor/PlaySceneButtonsWrapper'
import Teleprompter from './Teleprompter'
import { Scene, Line, DraftLine, Character } from '@/app/types'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons"
import EditorWrapper from '../editor/EditorWrapper'
import localFont from 'next/font/local'
import { useTeleprompter } from '@/app/context/teleprompterContext'
import { useCharacters } from '@/app/context/charactersContext'
import { useSceneDelay } from '@/app/context/countdownContext'

const sunsetSerialMediumFont = localFont({
  src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

type Props = {
  scene: Scene,
  lineItems: DraftLine[] | null,
  setSceneIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  sceneIsPlaying: boolean,
  setLines: React.Dispatch<React.SetStateAction<DraftLine[] | null>>
}

const PlaySceneWrapperOuter = ({ scene, lineItems, sceneIsPlaying, setSceneIsPlaying }: Props) => {

  const scrollRef = useRef<HTMLDivElement | null>(null)
  
  // Teleprompter state and context
  const { isTeleprompterActive } = useTeleprompter()
  const { characters } = useCharacters()
  const { countdown } = useSceneDelay()
  
  // State for teleprompter data passed from PlayerLineList
  const [teleprompterData, setTeleprompterData] = useState<{
    currentLine: DraftLine | null
    currentCharacter: Character | null
    matchedWordIndices: number[]
    delayCountdown: number | null
  }>({
    currentLine: null,
    currentCharacter: null,
    matchedWordIndices: [],
    delayCountdown: null
  })

  // Determine teleprompter line and character
  const teleprompterLine = teleprompterData.currentLine || (lineItems && lineItems[0]) || null
  const teleprompterCharacter = teleprompterData.currentCharacter || 
    (characters && lineItems && lineItems[0] ? characters.find(char => char.id === lineItems[0].character_id) : null) || null

  return (
    <div className="relative">
      
      {/* ENDLESS WHITE BACKGROUND - covers entire screen */}
      <div className="fixed inset-0 flex justify-center">
        <div className="w-full max-w-4xl bg-gradient-to-br from-slate-50 to-gray-100 shadow-sm border-x border-gray-200"></div>
      </div>
      
      {/* Main layout container */}
      <div className="relative z-10">

        <Navbar />
        
        {/* Teleprompter - rendered with higher z-index to stay on top */}
        {isTeleprompterActive && lineItems && lineItems.length > 0 && teleprompterLine && teleprompterCharacter && (
          <div 
            className="fixed inset-0 pointer-events-none z-50"
            style={{ filter: teleprompterData.delayCountdown !== null ? 'blur(8px)' : 'none' }}
          >
            <div className="pointer-events-auto">
              <Teleprompter
                currentLine={teleprompterLine}
                currentCharacter={teleprompterCharacter}
                matchedWordIndices={teleprompterData.delayCountdown !== null ? [] : teleprompterData.matchedWordIndices}
              />
            </div>
          </div>
        )}

        {/* Content Area - uses natural page scroll */}
        <div ref={scrollRef}>
          {/* Compact wrapper for player - less padding than EditorWrapper */}
          <div className="flex-grow max-w-4xl w-full mx-auto px-6 py-4">
            <div className="p-4">
              <div className="max-w-md mx-auto">
                <PlayerLineList
                  lineItems={lineItems}
                  sceneId={scene.id}
                  sceneIsPlaying={sceneIsPlaying}
                  setSceneIsPlaying={setSceneIsPlaying}
                  onTeleprompterUpdate={setTeleprompterData}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Play Button - transparent background so white shows through */}
        <PlaySceneButtonsWrapper
          setSceneIsPlaying={setSceneIsPlaying}
          sceneIsPlaying={sceneIsPlaying}
        />
      </div>
    </div>
  )
}

export default PlaySceneWrapperOuter