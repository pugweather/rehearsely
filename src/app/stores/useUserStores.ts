import { create } from "zustand"
import { User, UserStore } from "../types"

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    setUser: (user) => set({user})
}))