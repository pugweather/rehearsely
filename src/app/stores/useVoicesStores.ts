import { create } from "zustand"
import { VoicesStore } from "../types"
import { Voice } from "../types"

export const useVoicesStore = create<VoicesStore>((set) => ({
    voices: null,
    setVoices: (voices: Voice[] | null) => set({voices})
}))