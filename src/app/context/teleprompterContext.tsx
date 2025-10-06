"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type TeleprompterContextType = {
  isTeleprompterActive: boolean
  setIsTeleprompterActive: React.Dispatch<React.SetStateAction<boolean>>
}

const STORAGE_KEY = 'rehearsely_teleprompter_active'
const TeleprompterContext = createContext<TeleprompterContextType | undefined>(undefined)

export const TeleprompterProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage or use default (false)
  const [isTeleprompterActive, setIsTeleprompterActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'true'
    }
    return false
  })

  // Persist to localStorage whenever teleprompter state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, isTeleprompterActive.toString())
    }
  }, [isTeleprompterActive])

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