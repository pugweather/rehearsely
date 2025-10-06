"use client"
import React, { PropsWithChildren, useRef, useState, useEffect } from 'react'
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Navbar from "../layout/Navbar";
import EditorWrapper from "./EditorWrapper";
import SceneSettings from "./SceneSettings";
import LineList from "@/app/components/editor/LineList";
import RangeGradientLine from "@/app/components/editor/RangeGradientLine";
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

    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement | null>(null)
    const [headerExpanded, setHeaderExpanded] = useState(false)
    const [isBackLoading, setIsBackLoading] = useState(false)
    const headerRef = useRef<HTMLDivElement | null>(null)
    
    // Handle back button click with loading animation
    const handleBack = () => {
        setIsBackLoading(true)
        setTimeout(() => {
            router.push('/scenes')
        }, 300)
    }
    
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
        <div className="relative">
          
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
                <button onClick={handleBack} className="fixed top-20 left-[calc(50%-24rem)] max-[1200px]:left-[calc(50%-20rem)] max-[1000px]:left-[calc(50%-16rem)] max-[800px]:left-[calc(50%-12rem)] transition-all duration-200 ease-in-out inline-flex items-center gap-3 text-gray-700 hover:text-gray-900 group">
                  <div className={`w-12 h-12 rounded-full bg-white/70 border-2 border-black flex items-center justify-center transition-all duration-200 ${
                    isBackLoading 
                      ? 'cursor-not-allowed opacity-70 scale-95' 
                      : 'group-hover:bg-white group-hover:shadow-md group-hover:-translate-y-0.5'
                  }`}>
                    {isBackLoading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FontAwesomeIcon icon={faArrowLeftLong} className="text-lg" />
                    )}
                  </div>
                  <span className={`text-lg ${sunsetSerialMediumFont.className} ${isBackLoading ? 'opacity-70' : ''} w-[5rem] text-left`}>
                    {isBackLoading ? 'Loading...' : 'Back'}
                  </span>
                </button>
                {/* Compact Scene Header */}
                <div className="fixed left-1/2 -translate-x-1/2 top-20 text-black z-999">
                  <div className="relative" ref={headerRef}>
                    {/* Compact header button */}
                    <button 
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-black font-semibold transition-all duration-200 ${
                        headerExpanded 
                          ? 'bg-[#72a4f2] text-white shadow-xl' 
                          : 'bg-white text-gray-800 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                      } ${sunsetSerialMediumFont.className}`}
                      onClick={() => setHeaderExpanded(!headerExpanded)}
                    >
                      <span className="text-lg">{scene.name}</span>
                      <FontAwesomeIcon 
                        icon={headerExpanded ? faChevronUp : faChevronDown} 
                        className="text-sm transition-transform duration-200"
                      />
                    </button>
                    
                    {/* Expanded dropdown content - centered */}
                    {headerExpanded && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[480px] bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl border-4 border-black shadow-2xl transition-all duration-300 ease-out animate-in slide-in-from-top-2 fade-in zoom-in-95">
                        <div className="p-6">
                          <div className="flex items-center justify-center">
                            <div onClick={(e) => e.stopPropagation()}>
                              <SceneSettings
                                onRangeSelectionToggle={() => setHeaderExpanded(false)}
                                onClose={() => setHeaderExpanded(false)}
                              />
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
        
              {/* Range Gradient Line */}
              <RangeGradientLine />

              {/* Fixed play button - transparent background so white shows through */}
              <PlaySceneButtonsWrapper setSceneIsPlaying={setSceneIsPlaying} sceneIsPlaying={sceneIsPlaying}/>
          </div>
        </div>
      )
      
}

export default EditorWrapperOuter