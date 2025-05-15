import React from 'react'

type Props = {
  countdown: number
}

const CountdownModal = ({countdown}: Props) => {
  return (
    <div className='fixed inset-0 z-9999 flex items-center justify-center' style={{backgroundColor: "rgba(0,0,0,0.6"}}>
      <span className='text-6xl text-white'>{countdown}</span>
    </div>
  )
}

export default CountdownModal