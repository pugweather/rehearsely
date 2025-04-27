"use client"
import React, { useEffect } from 'react'
import { useVoicesStore } from '@/app/stores/useVoicesStores'

export default function InitVoices() {

    const voices = useVoicesStore((s) => s.voices)
    const setVoices = useVoicesStore((s) => s.setVoices)
    
    useEffect(() => {
        const fetchVoices = async() => {
            const res = await fetch("/api/private/voices")
            if (res.ok) {
                const voices = await res.json()
                setVoices(voices)
            } else {
                throw new Error("Unable to fetch voices from elevenlabs")
            }
        }
        fetchVoices()
    }, [setVoices])

    return null
}