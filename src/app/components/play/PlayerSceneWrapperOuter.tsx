"use client"
import React, { useRef } from 'react'
import Link from 'next/link'
import Navbar from '../layout/Navbar'
import PlayerLineList from './PlayerLineList'
import PlaySceneButtonsWrapper from '../editor/PlaySceneButtonsWrapper'
import { Scene, Line, DraftLine } from '@/app/types'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons"
import EditorWrapper from '../editor/EditorWrapper'
import localFont from 'next/font/local'

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

  return (
    <div className="relative min-h-screen">
      
      {/* ENDLESS WHITE BACKGROUND - covers entire screen */}
      <div className="fixed inset-0 flex justify-center">
        <div className="w-full max-w-4xl bg-gradient-to-br from-slate-50 to-gray-100 shadow-sm border-x border-gray-200"></div>
      </div>
      
      {/* Main layout container */}
      <div className="relative z-10">

        <Navbar />

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