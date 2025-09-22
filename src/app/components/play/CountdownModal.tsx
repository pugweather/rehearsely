import React from 'react'

type Props = {
  countdown: number | null
}

const CountdownModal = ({countdown}: Props) => {
  return (
    <div className='bg-red-600 fixed inset-0 z-20 flex items-center justify-center' style={{backgroundColor: "rgba(0,0,0,0.6"}}>
      <span className='text-[20rem] text-white'>{countdown}</span>
    </div>
  )
}

export default CountdownModal