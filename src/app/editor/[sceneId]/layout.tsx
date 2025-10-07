"use client"
import { ReactNode, useEffect } from 'react'

export default function SceneEditorLayout({
  children,
}: {
  children: ReactNode
}) {
  useEffect(() => {
    // Override overflow-hidden for editor pages only
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'

    return () => {
      // Restore when leaving editor pages
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    }
  }, [])

  return <>{children}</>
}
