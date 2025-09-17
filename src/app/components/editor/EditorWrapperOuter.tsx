"use client"
import React, { PropsWithChildren, useRef } from 'react'
import Link from "next/link";
import Navbar from "../layout/Navbar";
import EditorWrapper from "./EditorWrapper";
import SceneSettings from "./SceneSettings";
import LineList from "@/app/components/editor/LineList";
import ButtonLink from '../ui/ButtonLink';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faPlay } from "@fortawesome/free-solid-svg-icons";
import { DraftLine, Line } from '@/app/types';
import { Scene } from '@/app/types';
import PlaySceneButtonsWrapper from './PlaySceneButtonsWrapper';
import localFont from 'next/font/local';

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

const EditorWrapperOuter = ({scene, lineItems, sceneIsPlaying, setLines, setSceneIsPlaying}: Props) => {

    const scrollRef = useRef<HTMLDivElement | null>(null)
    
    return (
        <div className="flex flex-col h-screen bg-main">
          
          <Navbar />
      
          {/* scrollable area */}
          <div className="flex-1 overflow-y-scroll max-h-full" ref={scrollRef}>
            <EditorWrapper>
              <div className="relative text-black py-6 border-b border-b-gray-300 min-h-20">
                <Link href="/scenes">
                  <span className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 ease-in-out arrow-slide-on-hover inline-flex items-center gap-2 text-sm">
                    <span className="arrow-icon text-base leading-none flex items-center justify-center" style={{height: '1em', lineHeight: '1'}}>←</span>
                    <span className={`${sunsetSerialMediumFont.className}`}>Back to Scenes</span>
                  </span>
                </Link>
                <div className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 line-clamp-1 w-[27.5rem] text-center text-2xl font-medium text-gray-900 ${sunsetSerialMediumFont.className}`}>
                  {scene.name}
                </div>
              </div>
      
              <SceneSettings />
      
              <div className="flex flex-col items-center py-8">
                <div className="max-w-md w-full flex flex-col items-center pb-20">
                  <LineList
                    lineItems={lineItems}
                    sceneId={scene.id}
                    scrollRef={scrollRef}
                    setLines={setLines}
                  />
                </div>
              </div>
            </EditorWrapper>
          </div>
      
          {/* Fixed play button */}
          <div className="shrink-0 p-4 border-t border-gray-300 bg-main z-9999999">
            <PlaySceneButtonsWrapper setSceneIsPlaying={setSceneIsPlaying} sceneIsPlaying={sceneIsPlaying}/>
          </div>
        </div>
      )
      
}

export default EditorWrapperOuter