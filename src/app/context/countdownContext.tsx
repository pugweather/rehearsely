"use client"
import React, { createContext, useContext, useState } from "react"

type ContextType = {
  children: React.ReactNode
  countdown: number
  setCountdown: React.Dispatch<React.SetStateAction<number>>
}

const COUNTDOWN_DELAY = 10
export const countdownContext = createContext<ContextType | null>(null)

export const CountdownProvider = ({
  children,
  countdown = COUNTDOWN_DELAY,
  setCountdown,
}: ContextType) => {
  return (
    <countdownContext.Provider value={{children, countdown, setCountdown}}>
      {children}
    </countdownContext.Provider>
  )
}

export const useSceneDelay = () => {
  const ctx = useContext(countdownContext)
  if (!ctx) throw new Error("Missing context in sceneDelayContext")
  return ctx
}