"use client"
import React, { createContext, useContext, useMemo, useState, useEffect } from "react"

type ContextType = {
  countdown: number
  setCountdown: React.Dispatch<React.SetStateAction<number>>
}

const COUNTDOWN_DELAY = 3 // Default fallback
const STORAGE_KEY = 'rehearsely_countdown_delay'

export const countdownContext = createContext<ContextType | null>(null)

export const CountdownProvider = ({children}: {children: React.ReactNode}) => {
  // Initialize from localStorage or use default
  const [countdown, setCountdown] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? parseInt(saved, 10) : COUNTDOWN_DELAY
    }
    return COUNTDOWN_DELAY
  })

  // Persist to localStorage whenever countdown changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, countdown.toString())
    }
  }, [countdown])

  const value = useMemo(() => ({countdown, setCountdown}), [countdown])
  return (
    <countdownContext.Provider value={{countdown, setCountdown}}>
      {children}
    </countdownContext.Provider>
  )
}

export const useSceneDelay = () => {
  const ctx = useContext(countdownContext)
  if (!ctx) throw new Error("Missing context in sceneDelayContext")
  return ctx
}