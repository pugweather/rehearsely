"use client"
import { createContext, useContext } from "react";
import { DraftLine } from "../types";

type ContextType = {
    lineItemsState: DraftLine[] | null
    setLineItemsState: React.Dispatch<React.SetStateAction<DraftLine[] | null>>
}

export const lineItemsContext = createContext<ContextType | null>(null)

export const useLineItems = () => {
    const ctx = useContext(lineItemsContext)
    if (!ctx) throw new Error("Missing context in lineItemsContext")
    return ctx
}