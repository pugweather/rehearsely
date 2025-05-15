"use client"
import React, { useRef } from 'react'
import Link from 'next/link'
import Navbar from '../layout/Navbar'
import PlayerLineList from './PlayerLineList'
import PlaySceneButtonsWrapper from '../editor/PlaySceneButtonsWrapper'
import { Scene, Line } from '@/app/types'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons"
import EditorWrapper from '../editor/EditorWrapper'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
  src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

type Props = {
  scene: Scene,
  lineItems: Line[] | null,
  setSceneIsPlaying: React.Dispatch<React.SetStateAction<boolean>>,
  sceneIsPlaying: boolean
}

const PlaySceneWrapperOuter = ({ scene, lineItems, sceneIsPlaying, setSceneIsPlaying }: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="flex flex-col h-screen bg-main">

      <Navbar />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <EditorWrapper>

          <div className="flex flex-col items-center py-8">
            <div className="max-w-md w-full flex flex-col items-center pb-20">
              <PlayerLineList
                lineItems={lineItems}
                sceneId={scene.id}
              />
            </div>
          </div>
        </EditorWrapper>
      </div>

      {/* Fixed Play Button */}
      <div className="shrink-0 p-4 border-t border-gray-300 bg-main">
        <PlaySceneButtonsWrapper
          setSceneIsPlaying={setSceneIsPlaying}
          sceneIsPlaying={sceneIsPlaying}
        />
      </div>
    </div>
  )
}

export default PlaySceneWrapperOuter