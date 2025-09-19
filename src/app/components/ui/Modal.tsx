import React, { useEffect, useState } from 'react'

type Props = {
    children: React.ReactNode,
    width: number,
    height: number,
    isOpen?: boolean,
    onClose?: () => void
}

const Modal = ({children, width, height, isOpen = true, onClose}: Props) => {
    const [isVisible, setIsVisible] = useState(false)
    const [shouldRender, setShouldRender] = useState(isOpen)

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            // Small delay to ensure the modal is rendered before animating
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 10)
            return () => clearTimeout(timer)
        } else {
            setIsVisible(false)
            // Wait for animation to complete before removing from DOM
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, 200)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onClose) {
            onClose()
        }
    }

    if (!shouldRender) return null

    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center z-[9999] transition-all duration-200 ease-out ${
                isVisible 
                    ? 'opacity-100' 
                    : 'opacity-0'
            }`}
            style={{ backgroundColor: isVisible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)' }}
            onClick={handleBackdropClick}
        >
            <div
                className={`relative rounded-2xl bg-white overflow-hidden shadow-xl transition-all duration-200 ease-out ${
                    isVisible 
                        ? 'opacity-100 scale-100 translate-y-0' 
                        : 'opacity-0 scale-90 translate-y-4'
                }`}
                style={{ width: `${width}px`, height: `${height}px` }}
            >
                {children}
            </div>
        </div>
    )
}

export default Modal