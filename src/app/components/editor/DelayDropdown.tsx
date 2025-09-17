import React from 'react'
import { useSceneDelay } from '@/app/context/countdownContext'

const DelayDropdown = () => {

  const {countdown, setCountdown} = useSceneDelay()

  return (
    <div className='flex items-center gap-3'>
        <label htmlFor="delay-dropdown" className='text-sm font-medium' style={{color: '#202020'}}>Delay</label>
        <select 
          value={countdown} 
          onChange={(e) => setCountdown(Number(e.target.value))} 
          name="delay dropdown" 
          id="delay-dropdown" 
          className='px-3 py-2 rounded-lg text-sm font-medium border-0 focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer appearance-none bg-gradient-to-r'
          style={{
            backgroundColor: '#FFF4E6',
            color: '#CC7A00',
            border: '2px solid #FFA05A',
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23CC7A00' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.borderColor = '#FF8A3A'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = '#FFF4E6'
            e.currentTarget.style.borderColor = '#FFA05A'
            e.currentTarget.style.transform = 'translateY(0px)'
          }}
        >
            <option value={3}>3s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={15}>15s</option>
        </select>
    </div>
  )
}

export default DelayDropdown