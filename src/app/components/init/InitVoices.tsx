"use client"
import React, { useEffect } from 'react'
import { useVoicesStore } from '@/app/stores/useVoicesStores'
import { Voice } from '@/app/types'

export default function InitVoices() {

    const setVoices = useVoicesStore((s) => s.setVoices)
    const setVoicesCategorized = useVoicesStore((s) => s.setVoicesCategorized)

    const voiceCategories = {
        "Strong & Assertive": ["confident", "authoritative", "deep", "intense", "trustworthy"],
        "Warm & Approachable": ["friendly", "warm", "soft", "seductive", "natural"],
        "Energetic & Expressive": ["expressive", "playful", "upbeat", "casual", "articulate"],
    }

    useEffect(() => {
        const fetchVoices = async() => {
            const res = await fetch("/api/private/voices/voice_chars")
            if (res.ok) {
                const voicesRes = await res.json()
                const voicesJson = voicesRes.voices
                
                // Initialize fresh voicesCategorized object for each fetch
                const voicesCategorized: Record<string, {male: Voice[], female: Voice[]}> = {
                    "My Custom Voices": {
                        male: [],
                        female: []
                    },
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
                // Build 'voicesCategorized', which is more useful, restructured version of 'voicesJson' (see voicesCategorized initialization above for initial structure)
                voicesJson.forEach((voice: Voice) => {
                    const {gender, descriptive} = voice.labels || {}
                    let categorized = false;
                    
                    console.log(`Processing voice: ${voice.name}, gender: ${gender}, descriptive: ${descriptive}, category: ${voice.category}`)
                    
                    // First, check if it's a custom voice (category 'cloned' or 'generated')
                    if (voice.category === 'cloned' || voice.category === 'generated') {
                        // For custom voices, if no gender is specified, put them in male category as default
                        const voiceGender = gender && gender !== "non-binary" ? gender as "male" | "female" : "male";
                        
                        // Defensive check to ensure the structure exists
                        if (!voicesCategorized["My Custom Voices"]) {
                            console.error("My Custom Voices category is missing!");
                            voicesCategorized["My Custom Voices"] = { male: [], female: [] };
                        }
                        if (!voicesCategorized["My Custom Voices"][voiceGender]) {
                            console.error(`My Custom Voices ${voiceGender} array is missing!`);
                            voicesCategorized["My Custom Voices"][voiceGender] = [];
                        }
                        
                        voicesCategorized["My Custom Voices"][voiceGender].push(voice);
                        categorized = true;
                        console.log(`Custom voice added: ${voice.name} to ${voiceGender} category`);
                    }
                    
                    // Then categorize premade voices by descriptive
                    if (!categorized && descriptive) {
                        console.log(`Looking for descriptive "${descriptive}" in categories:`, Object.keys(voiceCategories))
                        for (const [category, descriptionsArray] of Object.entries(voiceCategories)) {
                            console.log(`Checking if "${descriptive}" is in [${descriptionsArray.join(', ')}]`)
                            if (descriptionsArray.includes(descriptive)) {
                                console.log(`✅ Match found! ${voice.name} (${descriptive}) → ${category}`)
                                // Don't know where to put non-binary so skip for now?
                                if (gender === "non-binary") {
                                    continue
                                } else if (gender) {
                                    voicesCategorized[category][gender as "male" | "female"].push(voice)
                                    categorized = true;
                                    break;
                                }
                            }
                        }
                        if (!categorized) {
                            console.log(`❌ No match found for descriptive: "${descriptive}"`)
                        }
                    }
                    
                    // If still not categorized and has a gender, put in "My Custom Voices" as fallback
                    if (!categorized && gender && gender !== "non-binary") {
                        console.log(`Uncategorized voice: ${voice.name}, category: ${voice.category}, descriptive: ${descriptive}`);
                        const targetGender = gender as "male" | "female";
                        
                        // Defensive check to ensure the structure exists
                        if (!voicesCategorized["My Custom Voices"]) {
                            console.error("My Custom Voices category is missing!");
                            voicesCategorized["My Custom Voices"] = { male: [], female: [] };
                        }
                        if (!voicesCategorized["My Custom Voices"][targetGender]) {
                            console.error(`My Custom Voices ${targetGender} array is missing!`);
                            voicesCategorized["My Custom Voices"][targetGender] = [];
                        }
                        
                        voicesCategorized["My Custom Voices"][targetGender].push(voice);
                    }
                })
                // All voices, unsorted 
                setVoices(voicesJson)
                setVoicesCategorized(voicesCategorized)
            } else {
                throw new Error("Unable to fetch voices from elevenlabs")
            }
        }
        fetchVoices()
    }, [setVoicesCategorized])

    return null
}