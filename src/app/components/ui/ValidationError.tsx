import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

type Props = {
  isVisible: boolean
  message: string
  className?: string
}

const ValidationError = ({ isVisible, message, className = "" }: Props) => {
  if (!isVisible) return null

  return (
    <div className={`flex items-center gap-2 mt-2 animate-in slide-in-from-left-2 fade-in duration-300 ${className}`}>
      <FontAwesomeIcon
        icon={faArrowRight}
        className="text-red-500 text-sm flex-shrink-0"
      />
      <span className="text-sm text-red-600 font-medium">
        {message}
      </span>
    </div>
  )
}

export default ValidationError