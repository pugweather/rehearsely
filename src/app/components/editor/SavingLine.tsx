'use client'
import React from 'react'
import localFont from 'next/font/local'

const courierPrimeRegular = localFont({
  src: "../../../../public/fonts/courierPrimeRegular.ttf",
})

interface SavingLineProps {
  characterName: string
  order: number
  text: string
}

const SavingLine = ({ characterName, order, text }: SavingLineProps) => {
  return (
    <div
      className={`w-full text-center mb-8 px-8 py-6 rounded-xl transition-all font-medium border relative cursor-not-allowed opacity-60 ${courierPrimeRegular.className}`}
      style={{
        backgroundColor: 'rgba(200,200,200,0.3)',
        borderColor: 'rgba(150,150,150,0.4)',
        borderWidth: '1px'
      }}
    >
      {/* Character Name */}
      <div className={`text-lg uppercase mb-3 transition-opacity duration-300 ease-in-out ${courierPrimeRegular.className}`} style={{ color: '#0a0a0a', letterSpacing: '0.05em' }}>
        {characterName}
      </div>

      {/* Line Text */}
      <div className={`text-lg leading-relaxed whitespace-pre-wrap ${courierPrimeRegular.className}`} style={{ color: '#0a0a0a' }}>
        {text}
      </div>

      {/* Saving State */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-sm text-gray-500 font-medium">saving</span>
        <svg
          width="32"
          height="12"
          viewBox="0 0 32 12"
          className="ml-1"
        >
          <circle cx="4" cy="8" r="2" fill="#72a4f2">
            <animate
              attributeName="cy"
              values="8;4;8"
              dur="1.4s"
              repeatCount="indefinite"
              begin="0s"
            />
          </circle>
          <circle cx="14" cy="8" r="2" fill="#ffa05a">
            <animate
              attributeName="cy"
              values="8;4;8"
              dur="1.4s"
              repeatCount="indefinite"
              begin="0.2s"
            />
          </circle>
          <circle cx="24" cy="8" r="2" fill="#FFD96E">
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

export default SavingLine
