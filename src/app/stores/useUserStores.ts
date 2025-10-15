import { create } from "zustand"
import { User, UserStore } from "../types"

// Create store with initial loading state
let initialLoadingState = true

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoading: initialLoadingState,
    setUser: (user) => {
        initialLoadingState = false
        set({user, isLoading: false})
    }
}))