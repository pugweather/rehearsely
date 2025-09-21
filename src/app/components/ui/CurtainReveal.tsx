import React, { useState, useEffect } from 'react'
import LoadingScreen from './LoadingScreen'

type Props = {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
}

const CurtainReveal = ({ isLoading, children, loadingText = "Loading" }: Props) => {
  const [showLoading, setShowLoading] = useState(isLoading)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isLoading) {
      // Show loading immediately
      setShowLoading(true)
      setShowContent(false)
    } else {
      // When loading finishes, start the transition
      setTimeout(() => {
        setShowLoading(false)
        setTimeout(() => {
          setShowContent(true)
        }, 100) // Small delay before showing content
      }, 300) // Keep loading screen for a moment
    }
  }, [isLoading])

  if (showLoading) {
    return <LoadingScreen text={loadingText} />
  }

  return (
    <div 
      className={`transition-opacity duration-1000 ease-out ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  )
}

export default CurtainReveal
