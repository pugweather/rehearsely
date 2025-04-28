import { create } from "zustand"
import { VoicesStore } from "../types"
import { Voice } from "../types"

export const useVoicesStore = create<VoicesStore>((set) => ({
    voices: null,
    voicesCategorized: null,
    setVoices: (voices: Voice[] | null) => set({voices}),
    setVoicesCategorized: (voicesCategorized: Record<string, {male: Voice[], female: Voice[]}> | null) => set({voicesCategorized})
}))