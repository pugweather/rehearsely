import { create } from "zustand"

type User = {
    id: string,
    name: string | null,
    email: string,
    created_at: string
}

type UserStore = {
    user: User | null,
    setUser: (user: User) => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    setUser: (user) => set({user})
}))