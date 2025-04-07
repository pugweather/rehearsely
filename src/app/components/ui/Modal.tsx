import React from 'react'

type Props = {
    children: React.ReactNode,
    width: number,
    height: number
}

const Modal = ({children, width, height}: Props) => {

    return (
        <div className='fixed inset-0 flex items-center justify-center z-9999' style={{backgroundColor: "rgba(0,0,0,0.6"}}>
            <div className={"relative rounded-xl bg-white overflow-hidden"} style={{width: width + "px", height: height  + "px"}}>
                {children}
            </div>
        </div>
    )
}

export default Modal