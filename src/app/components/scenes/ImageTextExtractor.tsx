"use client"
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Tesseract from 'tesseract.js'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

const ImageTextExtractor = () => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate it's an image
        if (!file.type.startsWith('image/')) {
            console.error('Please upload an image file')
            return
        }

        console.log('📷 Image uploaded:', file.name)
        setIsProcessing(true)
        setProgress(0)

        try {
            // Convert file to image URL for Tesseract
            const imageUrl = URL.createObjectURL(file)

            // Use Tesseract.js to extract text
            const result = await Tesseract.recognize(
                imageUrl,
                'eng', // Language: English (you can add more languages like 'eng+spa' for English + Spanish)
                {
                    logger: (m) => {
                        // Track progress
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100))
                            console.log(`Progress: ${Math.round(m.progress * 100)}%`)
                        }
                    }
                }
            )

            // Log the extracted text to console
            console.log('TEXT EXTRACTED FROM IMAGE:')
            console.log(result.data.text)
            console.log('Confidence:', result.data.confidence + '%')

            // Clean up
            URL.revokeObjectURL(imageUrl)
            setIsProcessing(false)
            setProgress(0)

        } catch (error) {
            console.error('❌ Error extracting text:', error)
            setIsProcessing(false)
            setProgress(0)
        }
    }

    return (
        <div className="relative">
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload-input"
                disabled={isProcessing}
            />
            <label
                htmlFor="image-upload-input"
                className={`px-6 py-3 bg-gradient-to-br from-[#ffa05a] to-[#ff8c3a] rounded-xl border-3 border-black font-bold text-lg transition-all duration-300 group relative overflow-hidden cursor-pointer inline-flex items-center gap-2 ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'
                }`}
            >
                {/* Subtle shine effect on hover */}
                {!isProcessing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                )}

                <span className={`flex items-center gap-2 relative z-10 text-white ${sunsetSerialMediumFont.className}`}>
                    {isProcessing ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="text-base animate-spin" />
                            Processing... {progress}%
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faImage} className="text-base" />
                            Test Image Upload (OCR)
                        </>
                    )}
                </span>
            </label>
        </div>
    )
}

export default ImageTextExtractor
