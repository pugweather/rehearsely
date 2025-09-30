"use client"
import React, { useState, useEffect } from 'react'
import { Scene } from '@/app/types'
import { DraftLine, Character } from '@/app/types'
import EditorWrapperOuter from './EditorWrapperOuter'
import PlaySceneWrapperOuter from '../play/PlayerSceneWrapperOuter'
import { CharactersProvider } from '@/app/context/charactersContext'
import { CountdownProvider } from '@/app/context/countdownContext'
import { TeleprompterProvider } from '@/app/context/teleprompterContext'
import CurtainReveal from '../ui/CurtainReveal'

type Props = {
    scene: Scene,
    lineItems: DraftLine[] | null
}

const EditorAndPlayWrapperClient = ({scene, lineItems}: Props) => {

    const DEFAULT_DELAY_SECONDS = 10
    const [characters, setCharacters] = useState<Character[] | null>(null)
    // const [sceneDelay, setSceneDelay] = useState<number | null>(DEFAULT_DELAY_SECONDS)
    const [sceneIsPlaying, setSceneIsPlaying] = useState<boolean>(false)
    const [lines, setLines] = useState<DraftLine[] | null>(
        lineItems
          ? [...lineItems].sort((a, b) => (a?.order ?? Infinity) - (b?.order ?? Infinity))
          : null
    );
    
    // Fetching characters
    useEffect(() => {
    const fetchSceneCharacters = async () => {
        try {
        const res = await fetch(`/api/private/scenes/${scene.id}/characters`)
        const charactersJson = await res.json()

        setCharacters(charactersJson)
        } catch (err) {
        console.error("Failed to catch characters for scene", err)
        }
    }
    fetchSceneCharacters()
    }, [scene.id])

    const isLoading = characters === null

    return (
        <TeleprompterProvider>
            <CharactersProvider characters={characters} setCharacters={setCharacters}>
                <CountdownProvider>
                    <CurtainReveal isLoading={isLoading} loadingText="Loading scene">
                        {
                            sceneIsPlaying ?
                            <PlaySceneWrapperOuter
                                scene={scene}
                                lineItems={lines}
                                setLines={setLines}
                                setSceneIsPlaying={setSceneIsPlaying}
                                sceneIsPlaying={sceneIsPlaying}
                            />
                            :
                            <EditorWrapperOuter
                                scene={scene}
                                lineItems={lines}
                                setLines={setLines}
                                setSceneIsPlaying={setSceneIsPlaying}
                                sceneIsPlaying={sceneIsPlaying}
                            />
                        }
                    </CurtainReveal>
                </CountdownProvider>
            </CharactersProvider>
        </TeleprompterProvider>
    )
}

export default EditorAndPlayWrapperClient