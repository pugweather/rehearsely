'use client'
import React from 'react'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
  src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

interface SavingLineProps {
  characterName: string
  order: number
  text: string
}

const SavingLine = ({ characterName, order, text }: SavingLineProps) => {
  return (
    <div className="relative group">
      <div className="flex items-start gap-4 p-4 bg-white/50 rounded-lg border-2 border-gray-300 pointer-events-none">

        {/* Order number */}
        <div className="flex-shrink-0 w-8 text-center">
          <span className="text-sm font-semibold text-gray-500">{order}</span>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Character name */}
          <div className={`text-lg font-bold text-gray-800 mb-2 ${sunsetSerialMediumFont.className}`}>
            {characterName}
          </div>

          {/* Line text (truncated if too long) */}
          <div className="text-gray-700 mb-3 text-sm leading-relaxed">
            {text.length > 100 ? `${text.substring(0, 100)}...` : text}
          </div>

          {/* Saving message with animated dots */}
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm italic">Saving line</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#72a4f2] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#ffa05a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#FFD96E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SavingLine
