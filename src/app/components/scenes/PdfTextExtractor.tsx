"use client"
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Tesseract from 'tesseract.js'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

// Declare global type for pdf.js from CDN
declare global {
    interface Window {
        pdfjsLib: any
    }
}

const PdfTextExtractor = () => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [pdfJsLoaded, setPdfJsLoaded] = useState(false)

    // Load PDF.js from CDN
    useEffect(() => {
        if (typeof window === 'undefined') return

        // Check if already loaded
        if (window.pdfjsLib) {
            setPdfJsLoaded(true)
            return
        }

        // Load PDF.js library
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        script.async = true
        script.onload = () => {
            // Configure worker
            if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
                setPdfJsLoaded(true)
                console.log('PDF.js loaded successfully')
            }
        }
        script.onerror = () => {
            console.error('Failed to load PDF.js')
        }
        document.head.appendChild(script)

        return () => {
            // Cleanup if needed
            if (script.parentNode) {
                script.parentNode.removeChild(script)
            }
        }
    }, [])

    const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Check if PDF.js is loaded
        if (!pdfJsLoaded || !window.pdfjsLib) {
            console.error('PDF.js is still loading. Please wait a moment and try again.')
            return
        }

        // Validate it's a PDF
        if (file.type !== 'application/pdf') {
            console.error('Please upload a PDF file')
            return
        }

        console.log('📄 PDF uploaded:', file.name)
        setIsProcessing(true)
        setCurrentPage(0)
        setTotalPages(0)

        try {
            // Convert file to ArrayBuffer for PDF.js
            const arrayBuffer = await file.arrayBuffer()

            // Load PDF document
            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
            const numPages = pdf.numPages
            setTotalPages(numPages)

            console.log(`PDF has ${numPages} page(s)`)

            let fullText = ''

            // Process each page
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                setCurrentPage(pageNum)
                console.log(`Processing page ${pageNum}/${numPages}...`)

                // Get the page
                const page = await pdf.getPage(pageNum)

                // Get viewport at 2x scale for better OCR accuracy
                const viewport = page.getViewport({ scale: 2.0 })

                // Create canvas
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d')
                if (!context) continue

                canvas.height = viewport.height
                canvas.width = viewport.width

                // Render PDF page to canvas
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise

                // Convert canvas to blob for Tesseract
                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((blob) => resolve(blob!), 'image/png')
                })

                // Use Tesseract to extract text from the image
                const result = await Tesseract.recognize(
                    blob,
                    'eng',
                    {
                        logger: (m) => {
                            if (m.status === 'recognizing text') {
                                console.log(`Page ${pageNum} OCR: ${Math.round(m.progress * 100)}%`)
                            }
                        }
                    }
                )

                // Add page text to full text
                fullText += `\n--- PAGE ${pageNum} ---\n`
                fullText += result.data.text
                fullText += '\n'

                console.log(`Page ${pageNum} extracted (Confidence: ${result.data.confidence}%)`)
            }

            // Log the complete extracted text
            console.log('TEXT EXTRACTED FROM PDF:')
            console.log(fullText)

            setIsProcessing(false)
            setCurrentPage(0)
            setTotalPages(0)

        } catch (error) {
            console.error('❌ Error extracting text from PDF:', error)
            setIsProcessing(false)
            setCurrentPage(0)
            setTotalPages(0)
        }

        // Reset file input
        event.target.value = ''
    }

    return (
        <div className="relative">
            <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
                id="pdf-upload-input"
                disabled={isProcessing}
            />
            <label
                htmlFor="pdf-upload-input"
                className={`px-6 py-3 bg-gradient-to-br from-[#ef4444] to-[#dc2626] rounded-xl border-3 border-black font-bold text-lg transition-all duration-300 group relative overflow-hidden cursor-pointer inline-flex items-center gap-2 ${
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
                            Page {currentPage}/{totalPages}
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faFilePdf} className="text-base" />
                            Test PDF Upload (OCR)
                        </>
                    )}
                </span>
            </label>
        </div>
    )
}

export default PdfTextExtractor
