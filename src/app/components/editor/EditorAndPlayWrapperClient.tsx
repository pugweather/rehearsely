"use client"
import React, { useState, useEffect, useMemo } from 'react'
import { Scene } from '@/app/types'
import { DraftLine, Character } from '@/app/types'
import EditorWrapperOuter from './EditorWrapperOuter'
import PlaySceneWrapperOuter from '../play/PlayerSceneWrapperOuter'
import { CharactersProvider } from '@/app/context/charactersContext'
import { CountdownProvider } from '@/app/context/countdownContext'
import { TeleprompterProvider } from '@/app/context/teleprompterContext'
import { PracticeRangeProvider, usePracticeRange } from '@/app/context/practiceRangeContext'
import CurtainReveal from '../ui/CurtainReveal'

type Props = {
    scene: Scene,
    lineItems: DraftLine[] | null
}

// Inner component that has access to PracticeRangeContext
const EditorAndPlayWrapperInner = ({scene, lineItems}: Props) => {
    const [sceneIsPlaying, setSceneIsPlaying] = useState<boolean>(false)
    const [lines, setLines] = useState<DraftLine[] | null>(
        lineItems
          ? [...lineItems].sort((a, b) => (a?.order ?? Infinity) - (b?.order ?? Infinity))
          : null
    );

    const { startLineId, endLineId } = usePracticeRange()

    // Filter lines based on range when playing
    const filteredLines = useMemo(() => {
        if (!sceneIsPlaying || !lines) return lines
        if (!startLineId && !endLineId) return lines

        return lines.filter(line => {
            if (!line?.order) return true

            // Both start and end are set
            if (startLineId && endLineId) {
                const startLine = lines.find(l => l.id === startLineId)
                const endLine = lines.find(l => l.id === endLineId)

                if (!startLine?.order || !endLine?.order) return true

                const minOrder = Math.min(startLine.order, endLine.order)
                const maxOrder = Math.max(startLine.order, endLine.order)

                return line.order >= minOrder && line.order <= maxOrder
            }

            // Only start is set - include start and everything after
            if (startLineId && !endLineId) {
                const startLine = lines.find(l => l.id === startLineId)
                if (!startLine?.order) return true
                return line.order >= startLine.order
            }

            // Only end is set - include everything up to and including end
            if (!startLineId && endLineId) {
                const endLine = lines.find(l => l.id === endLineId)
                if (!endLine?.order) return true
                return line.order <= endLine.order
            }

            return true
        })
    }, [sceneIsPlaying, lines, startLineId, endLineId])

    return (
        <>
            {
                sceneIsPlaying ?
                <PlaySceneWrapperOuter
                    scene={scene}
                    lineItems={filteredLines}
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
        </>
    )
}

const EditorAndPlayWrapperClient = ({scene, lineItems}: Props) => {

    const DEFAULT_DELAY_SECONDS = 10
    const [characters, setCharacters] = useState<Character[] | null>(null)
    const [linesBeingProcessed, setLinesBeingProcessed] = useState<Set<number>>(new Set())

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

    // Check for lines that need audio generation
    useEffect(() => {
        const linesNeedingAudioStr = sessionStorage.getItem('linesNeedingAudio')
        if (!linesNeedingAudioStr) return

        const linesNeedingAudio = JSON.parse(linesNeedingAudioStr)

        // Clear from sessionStorage so we don't process again on refresh
        sessionStorage.removeItem('linesNeedingAudio')

        // Start generating audio for each line in the background
        linesNeedingAudio.forEach((lineInfo: any) => {
            generateAudioForLine(lineInfo.lineId, lineInfo.text, lineInfo.voiceName)
        })
    }, [])

    const generateAudioForLine = async (lineId: number, text: string, voiceName: string) => {
        setLinesBeingProcessed(prev => new Set(prev).add(lineId))

        try {
            const response = await fetch(`/api/private/lines/${lineId}/generate-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, voiceName })
            })

            if (response.ok) {
                const result = await response.json()
                console.log(`Audio generated for line ${lineId}:`, result.audioUrl)

                // Line will be updated via database, we just need to remove from processing set
                setLinesBeingProcessed(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(lineId)
                    return newSet
                })

                // Trigger a re-fetch of lines to show the updated line
                // This could be optimized to update state directly
                window.location.reload()
            } else {
                console.error(`Failed to generate audio for line ${lineId}`)
                setLinesBeingProcessed(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(lineId)
                    return newSet
                })
            }
        } catch (error) {
            console.error(`Error generating audio for line ${lineId}:`, error)
            setLinesBeingProcessed(prev => {
                const newSet = new Set(prev)
                newSet.delete(lineId)
                return newSet
            })
        }
    }

    const isLoading = characters === null

    return (
        <PracticeRangeProvider>
            <TeleprompterProvider>
                <CharactersProvider characters={characters} setCharacters={setCharacters}>
                    <CountdownProvider>
                        <CurtainReveal isLoading={isLoading} loadingText="Loading scene">
                            <EditorAndPlayWrapperInner scene={scene} lineItems={lineItems} />
                        </CurtainReveal>
                    </CountdownProvider>
                </CharactersProvider>
            </TeleprompterProvider>
        </PracticeRangeProvider>
    )
}

export default EditorAndPlayWrapperClient