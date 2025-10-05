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
    const [lines, setLines] = useState<DraftLine[] | null>(lineItems);

    // Update lines when lineItems prop changes (e.g., when audio is generated)
    useEffect(() => {
        setLines(lineItems)
    }, [lineItems])

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
    const [lines, setLines] = useState<DraftLine[] | null>(
        lineItems
          ? [...lineItems].sort((a, b) => (a?.order ?? Infinity) - (b?.order ?? Infinity))
          : null
    )
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

        // Start generating audio for each line with staggered delays to avoid rate limiting
        linesNeedingAudio.forEach((lineInfo: any, index: number) => {
            // Stagger requests by 500ms each to avoid overwhelming the API
            setTimeout(() => {
                generateAudioForLine(lineInfo.lineId, lineInfo.text, lineInfo.voiceId)
            }, index * 500)
        })
    }, [])

    const generateAudioForLine = async (lineId: number, text: string, voiceId: string, retryCount = 0) => {
        const MAX_RETRIES = 3
        const RETRY_DELAY = 2000 // 2 seconds

        setLinesBeingProcessed(prev => new Set(prev).add(lineId))

        try {
            console.log(`🎵 Generating audio for line ${lineId} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`)

            const response = await fetch(`/api/private/lines/${lineId}/generate-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, voiceId })
            })

            if (response.ok) {
                const result = await response.json()
                console.log(`✅ Audio generated for line ${lineId}:`, result.audioUrl)

                // Update the line in state with the new audio URL
                setLines(prev => {
                    if (!prev) return prev
                    return prev.map(line =>
                        line.id === lineId
                            ? { ...line, audio_url: result.audioUrl }
                            : line
                    )
                })

                // Remove from processing set
                setLinesBeingProcessed(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(lineId)
                    return newSet
                })
            } else {
                const errorData = await response.json()
                console.error(`❌ Failed to generate audio for line ${lineId}:`, errorData)

                // Retry if we haven't exceeded max retries
                if (retryCount < MAX_RETRIES) {
                    console.log(`🔄 Retrying line ${lineId} in ${RETRY_DELAY}ms...`)
                    setTimeout(() => {
                        generateAudioForLine(lineId, text, voiceId, retryCount + 1)
                    }, RETRY_DELAY)
                } else {
                    // Max retries exceeded
                    console.error(`💥 Max retries exceeded for line ${lineId}`)
                    setLinesBeingProcessed(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(lineId)
                        return newSet
                    })
                    alert(`Failed to generate audio for line ${lineId} after ${MAX_RETRIES + 1} attempts: ${errorData.details || errorData.error}`)
                }
            }
        } catch (error) {
            console.error(`❌ Error generating audio for line ${lineId}:`, error)

            // Retry if we haven't exceeded max retries
            if (retryCount < MAX_RETRIES) {
                console.log(`🔄 Retrying line ${lineId} in ${RETRY_DELAY}ms...`)
                setTimeout(() => {
                    generateAudioForLine(lineId, text, voiceId, retryCount + 1)
                }, RETRY_DELAY)
            } else {
                // Max retries exceeded
                console.error(`💥 Max retries exceeded for line ${lineId}`)
                setLinesBeingProcessed(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(lineId)
                    return newSet
                })
                alert(`Error generating audio for line ${lineId} after ${MAX_RETRIES + 1} attempts. Check console for details.`)
            }
        }
    }

    const isLoading = characters === null

    return (
        <PracticeRangeProvider>
            <TeleprompterProvider>
                <CharactersProvider characters={characters} setCharacters={setCharacters}>
                    <CountdownProvider>
                        <CurtainReveal isLoading={isLoading} loadingText="Loading scene">
                            <EditorAndPlayWrapperInner scene={scene} lineItems={lines} />
                        </CurtainReveal>
                    </CountdownProvider>
                </CharactersProvider>
            </TeleprompterProvider>
        </PracticeRangeProvider>
    )
}

export default EditorAndPlayWrapperClient