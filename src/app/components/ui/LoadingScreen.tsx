import React from 'react'
import localFont from 'next/font/local'

const sunsetSerialMedium = localFont({
  src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

type Props = {
  text?: string
}

const LoadingScreen = ({ text = "Loading" }: Props) => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className={`${sunsetSerialMedium.className} text-3xl font-medium text-black flex items-baseline gap-1`}>
        <span>{text}</span>
        <svg 
          width="32" 
          height="12" 
          viewBox="0 0 32 12" 
          className="ml-1"
        >
          <circle cx="4" cy="8" r="2" fill="currentColor">
            <animate
              attributeName="cy"
              values="8;4;8"
              dur="1.4s"
              repeatCount="indefinite"
              begin="0s"
            />
          </circle>
          <circle cx="14" cy="8" r="2" fill="currentColor">
            <animate
              attributeName="cy"
              values="8;4;8"
              dur="1.4s"
              repeatCount="indefinite"
              begin="0.2s"
            />
          </circle>
          <circle cx="24" cy="8" r="2" fill="currentColor">
            <animate
              attributeName="cy"
              values="8;4;8"
              dur="1.4s"
              repeatCount="indefinite"
              begin="0.4s"
            />
          </circle>
        </svg>
      </div>
    </div>
  )
}

export default LoadingScreen
