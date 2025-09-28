import { create } from "zustand"
import { User, UserStore } from "../types"

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({user, isLoading: false})
}))