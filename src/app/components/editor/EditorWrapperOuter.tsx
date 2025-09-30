"use client"
import React, { PropsWithChildren, useRef, useState, useEffect } from 'react'
import Link from "next/link";
import Navbar from "../layout/Navbar";
import EditorWrapper from "./EditorWrapper";
import SceneSettings from "./SceneSettings";
import LineList from "@/app/components/editor/LineList";
import ButtonLink from '../ui/ButtonLink';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faPlay, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
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
    const [headerExpanded, setHeaderExpanded] = useState(false)
    const headerRef = useRef<HTMLDivElement | null>(null)
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setHeaderExpanded(false)
            }
        }
        
        if (headerExpanded) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [headerExpanded])
    
    return (
        <div className="relative min-h-screen">
          
          {/* ENDLESS WHITE BACKGROUND - covers entire screen */}
          <div className="fixed inset-0 flex justify-center">
            <div className="w-full max-w-4xl bg-gradient-to-br from-slate-50 to-gray-100 shadow-sm border-x border-gray-200"></div>
          </div>
          
          {/* Main layout container */}
          <div className="relative z-10">
            
            <Navbar />
        
            {/* Content area - uses natural page scroll */}
            <div ref={scrollRef}>
         <EditorWrapper>
                {/* Back to scenes button */}
                <Link href="/scenes" onClick={(e) => e.stopPropagation()}>
                  <span className="fixed top-20 left-1/2 -translate-x-1/2 ml-[-24rem] max-[1200px]:ml-[-20rem] max-[1000px]:ml-[-16rem] max-[800px]:ml-[-12rem] px-3 py-2 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-all duration-200 ease-in-out arrow-slide-on-hover inline-flex items-center gap-2 text-base whitespace-nowrap">
                    <svg className="arrow-icon w-3.5 h-3.5" viewBox="0 0 16 12" fill="currentColor">
                      <path d="M8 2L2 8l6 6M4 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                    <span className={`${sunsetSerialMediumFont.className}`}>Back</span>
                  </span>
                </Link>
                {/* Compact Scene Header */}
                <div className="fixed left-1/2 -translate-x-1/2 top-20 text-black z-999">
                  <div className="relative" ref={headerRef}>
                    {/* Compact header button */}
                    <button 
                      className={`transition-all duration-200 ease-in-out cursor-pointer min-w-32 max-w-48 px-3 py-2 rounded-md ${
                        headerExpanded 
                          ? 'bg-gray-100 shadow-md' 
                          : 'hover:bg-gray-50 shadow-sm hover:shadow-md'
                      }`}
                      style={{ backgroundColor: headerExpanded ? '#f5f5f5' : 'var(--bg-page)' }}
                      onClick={() => setHeaderExpanded(!headerExpanded)}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-medium text-gray-700 truncate pr-2 ${sunsetSerialMediumFont.className}`}>
                          {scene.name}
                        </div>
                        <FontAwesomeIcon 
                          icon={headerExpanded ? faChevronUp : faChevronDown} 
                          className="w-3 h-3 text-gray-500 transition-transform duration-200 flex-shrink-0"
                        />
                      </div>
                    </button>
                    
                    {/* Expanded dropdown content */}
                    {headerExpanded && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[32rem] rounded-xl transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 fade-in zoom-in-95 shadow-sm hover:shadow-md"
                        style={{
                          backgroundColor: '#FFF4E6',
                          border: '2px solid rgba(255, 160, 90, 0.4)'
                        }}
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-center">
                            {/* Scene settings */}
                            <div onClick={(e) => e.stopPropagation()}>
                              <SceneSettings />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
        
                <div className="flex flex-col items-center">
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
        
              {/* Fixed play button - transparent background so white shows through */}
              <PlaySceneButtonsWrapper setSceneIsPlaying={setSceneIsPlaying} sceneIsPlaying={sceneIsPlaying}/>
          </div>
        </div>
      )
      
}

export default EditorWrapperOuter