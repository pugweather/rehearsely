import React from 'react'

type Props={
    isOpen: boolean,
    children: React.ReactNode
}

const Modal = ({isOpen, children}: Props) => {

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black opacity-50 flex items-center justify-center'>
            <div className={'rounded-xl bg-white w-1/4 aspect-square'}>
                {children}
            </div>
        </div>
    )
}

export default Modal