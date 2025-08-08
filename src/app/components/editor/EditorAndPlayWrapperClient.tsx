"use client"
import React, { useState } from 'react'
import { Scene } from '@/app/types'
import { DraftLine } from '@/app/types'
import EditorWrapperOuter from './EditorWrapperOuter'
import PlaySceneWrapperOuter from '../play/PlayerSceneWrapperOuter'

type Props = {
    scene: Scene,
    lineItems: DraftLine[] | null
}

const EditorAndPlayWrapperClient = ({scene, lineItems}: Props) => {

    const [sceneIsPlaying, setSceneIsPlaying] = useState<boolean>(false)
    const [lines, setLines] = useState<DraftLine[] | null>(
        lineItems
          ? [...lineItems].sort((a, b) => (a?.order ?? Infinity) - (b?.order ?? Infinity))
          : null
    );

    return (
        <div>
            {
                sceneIsPlaying ? 
                <PlaySceneWrapperOuter
                    scene={scene}
                    lineItems={lines}
                    setLines={setLines}
                    setSceneIsPlaying={setSceneIsPlaying}
                    sceneIsPlaying={sceneIsPlaying}
                >
                </PlaySceneWrapperOuter> 
                :
                <EditorWrapperOuter
                    scene={scene}
                    lineItems={lines}
                    setLines={setLines}
                    setSceneIsPlaying={setSceneIsPlaying}
                    sceneIsPlaying={sceneIsPlaying}
                >
                </EditorWrapperOuter>
            }
        </div>
    )
}

export default EditorAndPlayWrapperClient