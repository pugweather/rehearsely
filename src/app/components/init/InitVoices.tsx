"use client"
import React, { useEffect } from 'react'
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import { Voice } from '@/app/types'

export default function InitVoices() {

    const voices = useVoicesStore((s) => s.voices)
    const setVoices = useVoicesStore((s) => s.setVoices)
    const setVoicesCategorized = useVoicesStore((s) => s.setVoicesCategorized)

    const voiceCategories = {
        "Strong & Assertive": ["confident", "authoritative", "deep", "intense", "trustworthy"],
        "Warm & Approachable": ["friendly", "warm", "soft", "seductive", "natural"],
        "Energetic & Expressive": ["expressive", "playful", "upbeat", "casual", "articulate"],
    }

   var voicesCategorized: Record<string, {male: Voice[], female: Voice[]}> = {
        "Strong & Assertive": {
            male: [],
            female: []
        },
        "Warm & Approachable": {
            male: [],
            female: []
        },
        "Energetic & Expressive": {
            male: [],
            female: []
        }
    }
    
    useEffect(() => {
        const fetchVoices = async() => {
            const res = await fetch("/api/private/voices/voice_chars")
            if (res.ok) {
                const voicesRes = await res.json()
                const voicesJson = voicesRes.voices
                // Build 'voicesCategorized', which is more useful, restructured version of 'voicesJson' (see voicesCategorized initialization above for initial structure)
                voicesJson.forEach((voice: Voice) => {
                    const {gender, description} = voice.labels
                    for (const [category, descriptionsArray] of Object.entries(voiceCategories)) {
                        if (descriptionsArray.includes(description)) {
                            // Don't know where to put non-binary so skip for now?
                            if (gender === "non-binary") {
                                continue
                            } else {
                                voicesCategorized[category][gender as "male" | "female"].push(voice)
                            }
                        }
                    }
                })
                console.log(voicesCategorized)
                // All voices, unsorted 
                setVoices(voicesJson.voices)
                setVoicesCategorized(voicesCategorized)
            } else {
                throw new Error("Unable to fetch voices from elevenlabs")
            }
        }
        fetchVoices()
    }, [setVoices])

    return null
}