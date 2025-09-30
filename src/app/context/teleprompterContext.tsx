"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react'

type TeleprompterContextType = {
  isTeleprompterActive: boolean
  setIsTeleprompterActive: React.Dispatch<React.SetStateAction<boolean>>
}

const TeleprompterContext = createContext<TeleprompterContextType | undefined>(undefined)

export const TeleprompterProvider = ({ children }: { children: ReactNode }) => {
  const [isTeleprompterActive, setIsTeleprompterActive] = useState<boolean>(false)

  return (
    <TeleprompterContext.Provider value={{ isTeleprompterActive, setIsTeleprompterActive }}>
      {children}
    </TeleprompterContext.Provider>
  )
}

export const useTeleprompter = () => {
  const context = useContext(TeleprompterContext)
  if (context === undefined) {
    throw new Error('useTeleprompter must be used within a TeleprompterProvider')
  }
  return context
}