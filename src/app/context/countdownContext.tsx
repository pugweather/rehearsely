"use client"
import React, { createContext, useContext, useMemo, useState } from "react"

type ContextType = {
  countdown: number
  setCountdown: React.Dispatch<React.SetStateAction<number>>
}

const COUNTDOWN_DELAY = 10
export const countdownContext = createContext<ContextType | null>(null)

export const CountdownProvider = ({children}: {children: React.ReactNode}) => {
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_DELAY)
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