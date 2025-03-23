"use client"
import { useEffect } from "react";
import { useUserStore } from "@/app/stores/useUserStores";

export default function InitUser() {

    const user = useUserStore((s) => s.user)
    const setUser = useUserStore((s => s.setUser)) 

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch("/api/private")
            const userData = await res.json()
            if (res.ok) {
                setUser(userData.user)
            }
        }
        fetchUser()
    }, [setUser])
    
    return null
}