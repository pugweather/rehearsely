"use client"
import React, { PropsWithChildren, useRef } from 'react'
import Link from "next/link";
import Navbar from "../../components/layout/Navbar";
import EditorWrapper from "../../components/editor/EditorWrapper";
import SceneSettings from "../../components/editor/SceneSettings";
import LineList from "@/app/components/editor/LineList";
import ButtonLink from '../ui/ButtonLink';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Line } from '@/app/types';
import { Scene } from '@/app/types';

type Props = {
    scene: Scene,
    lineItems: Line[] | null
}

const EditorWrapperClient = ({scene, lineItems}: Props) => {

    const scrollRef = useRef<HTMLDivElement | null>(null)
    
    return (
        <div 
            className="min-h-screen bg-gray-200 flex flex-col"
            ref={scrollRef}
        >
            <Navbar />
                <EditorWrapper>
                    <div className="relative text-gray-500 py-6 border-b border-b-gray-300">
                        <Link href="/scenes-dashboard">
                            <span className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 ease-in-out">
                                <FontAwesomeIcon icon={faArrowLeftLong} /> 
                                <span className="ml-1">Back to Scenes</span>
                            </span>
                        </Link>
                        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-xl font-medium text-gray-900">{scene.name}</div>
                    </div>
                    <SceneSettings />
                    <div className="flex flex-col items-center py-8">
                        <div className="max-w-md w-full flex flex-col items-center">
                            <LineList 
                                lineItems={lineItems} 
                                sceneId={scene.id}
                                scrollRef={scrollRef}
                            />
                        </div>
                    </div>
                </EditorWrapper>
        </div>
    )
}

export default EditorWrapperClient