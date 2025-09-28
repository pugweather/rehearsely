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
    // Wait for animation to complete before calling parent close function
    setTimeout(() => {
      onClose()
    }, 200)
  }

  return (
    <Modal width={520} height={250} isOpen={isModalOpen} onClose={handleClose}>
      <div
        className='flex flex-col h-full rounded-2xl'
        style={{
          backgroundColor: '#E3D6C6',
          border: `1px solid ${errorType === 'no_device' ? '#DC2626' : 'rgba(32,32,32,0.1)'}`
        }}
      >
        <div className='relative px-6 py-5'>
          <div className='text-xl font-semibold' style={{color: '#202020'}}>
            {errorType === 'no_device' ? 'No Microphone Found' : 'Microphone Access Required'}
          </div>
          <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)', color: '#202020'}}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-4 flex items-start gap-3'>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className='text-xl'
            style={{color: errorType === 'no_device' ? '#DC2626' : '#CC7A00'}}
          />
          <div className='text-base' style={{color: '#202020'}}>
            {errorType === 'no_device'
              ? 'No microphone was detected. Please connect a microphone or use headphones with a built-in mic to record lines and play scenes.'
              : 'Allow microphone access in the browser to record lines and play scenes.'
            }
          </div>
        </div>

        {/* Footer */}
        <div className='mt-auto px-6 py-4 flex items-center justify-end gap-3'>
          <button onClick={handleClose}>
            <ButtonLink text={'Got it'} bgColor={'#FFA05A'} className='px-4 py-2' />
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default MicErrorModal