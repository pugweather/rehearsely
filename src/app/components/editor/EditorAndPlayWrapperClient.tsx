"use client"
import React, { useState } from 'react'
import { Scene } from '@/app/types'
import { Line } from '@/app/types'
import EditorWrapperOuter from './EditorWrapperOuter'
import PlaySceneWrapperOuter from '../play/PlayerSceneWrapperOuter'

type Props = {
    scene: Scene,
    lineItems: Line[] | null
}

const EditorAndPlayWrapperClient = ({scene, lineItems}: Props) => {

    const [sceneIsPlaying, setSceneIsPlaying] = useState<boolean>(false)

    console.log(sceneIsPlaying)

    return (
        <div>
            {
                sceneIsPlaying ? 
                <PlaySceneWrapperOuter
                    scene={scene}
                    lineItems={lineItems}
                    setSceneIsPlaying={setSceneIsPlaying}
                    sceneIsPlaying={sceneIsPlaying}
                >
                </PlaySceneWrapperOuter> 
                :
                <EditorWrapperOuter
                    scene={scene}
                    lineItems={lineItems}
                    setSceneIsPlaying={setSceneIsPlaying}
                    sceneIsPlaying={sceneIsPlaying}
                >
                </EditorWrapperOuter>
            }
        </div>
    )
}

export default EditorAndPlayWrapperClient