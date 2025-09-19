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
    <div className="relative h-screen overflow-hidden">
      
      {/* ENDLESS WHITE BACKGROUND - covers entire screen */}
      <div className="fixed inset-0 flex justify-center">
        <div className="w-full max-w-4xl bg-gradient-to-br from-slate-50 to-gray-100 shadow-sm border-x border-gray-200"></div>
      </div>
      
      {/* Main layout container */}
      <div className="relative z-10 flex flex-col h-screen">

        <Navbar />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <EditorWrapper>

            <div className="flex flex-col items-center py-8">
              <div className="max-w-md w-full flex flex-col items-center pb-20">
                <PlayerLineList
                  lineItems={lineItems}
                  sceneId={scene.id}
                  sceneIsPlaying={sceneIsPlaying}
                  setSceneIsPlaying={setSceneIsPlaying}
                />
              </div>
            </div>
          </EditorWrapper>
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