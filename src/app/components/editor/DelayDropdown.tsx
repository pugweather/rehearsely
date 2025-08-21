import React from 'react'
import { useSceneDelay } from '@/app/context/countdownContext'

const DelayDropdown = () => {

  const {countdown, setCountdown} = useSceneDelay()

  return (
    <div className='font-medium'>
        <label htmlFor="delay-dropdown" className='mr-3'>Delay</label>
        <select value={countdown} onChange={(e) => setCountdown(Number(e.target.value))} name="delay dropdown" id="delay-dropdown" className='pr-1'>
            <option value={3}>3s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={15} >15s</option>
        </select>
    </div>
    

  )
}

export default DelayDropdown