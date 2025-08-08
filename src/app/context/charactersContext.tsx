// charactersContext.tsx
"use client"
import React, { createContext, useContext } from "react"
import { Character } from "../types"

type ContextType = {
children: React.ReactNode
  characters: Character[] | null
  setCharacters: React.Dispatch<React.SetStateAction<Character[] | null>>
}

export const charactersContext = createContext<ContextType | null>(null)

export const CharactersProvider = ({
  children,
  characters,
  setCharacters,
}: ContextType) => {
  return (
    <charactersContext.Provider value={{children, characters, setCharacters }}>
      {children}
    </charactersContext.Provider>
  )
}

export const useCharacters = () => {
  const ctx = useContext(charactersContext)
  if (!ctx) throw new Error("Missing context in charactersContext")
  return ctx
}
