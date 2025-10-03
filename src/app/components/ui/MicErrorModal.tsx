import React, { useState } from 'react'
import Modal from './Modal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import ButtonLink from './ButtonLink'

type Props = {
  isOpen: boolean
  onClose: () => void
  errorType?: 'permission' | 'no_device'
}

const MicErrorModal = ({ isOpen, onClose, errorType = 'permission' }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen)

  React.useEffect(() => {
    setIsModalOpen(isOpen)
  }, [isOpen])

  const handleClose = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  return (
    <Modal width={520} height={280} isOpen={isModalOpen} onClose={handleClose}>
      <div className={`flex flex-col h-full rounded-2xl bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] shadow-xl ${errorType === 'no_device' ? 'border-4 border-red-600' : 'border-4 border-yellow-500'}`}>
        <div className='relative px-6 py-5'>
          <div className='text-2xl font-bold text-gray-800'>
            {errorType === 'no_device' ? 'No Microphone Found' : 'Microphone Access Required'}
          </div>
          <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200"
          >
            <FontAwesomeIcon icon={faClose} className="text-gray-700" />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-4 flex items-start gap-4'>
          <div className={`w-12 h-12 rounded-full border-3 flex items-center justify-center flex-shrink-0 ${errorType === 'no_device' ? 'border-red-600 bg-red-100' : 'border-yellow-500 bg-yellow-100'}`}>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className={`text-xl ${errorType === 'no_device' ? 'text-red-600' : 'text-yellow-600'}`}
            />
          </div>
          <div className='text-lg text-gray-800 leading-relaxed'>
            {errorType === 'no_device'
              ? 'No microphone was detected. Please connect a microphone or use headphones with a built-in mic to record lines and play scenes.'
              : 'Allow microphone access in the browser to record lines and play scenes.'
            }
          </div>
        </div>

        {/* Footer */}
        <div className='mt-auto px-6 py-4 flex items-center justify-end'>
          <button 
            onClick={handleClose}
            className="px-6 py-3 bg-gradient-to-br from-[#ffa05a] to-[#ff8a3a] rounded-xl border-3 border-black font-bold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default MicErrorModal