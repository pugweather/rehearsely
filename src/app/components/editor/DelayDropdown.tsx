import React from 'react'
import { useSceneDelay } from '@/app/context/countdownContext'

const DelayDropdown = () => {

  const {countdown, setCountdown} = useSceneDelay()

  return (
    <div className='flex items-center gap-3'>
        <label htmlFor="delay-dropdown" className='text-sm font-medium' style={{color: '#CC7A00'}}>Delay</label>
        <select
          value={countdown}
          onChange={(e) => setCountdown(Number(e.target.value))}
          name="delay dropdown"
          id="delay-dropdown"
          className='px-3 py-2 rounded-lg text-sm font-medium focus:outline-none transition-all duration-300 ease-in-out cursor-pointer appearance-none'
          style={{
            backgroundColor: '#FFF4E6',
            color: '#CC7A00',
            border: '2px solid rgba(255, 160, 90, 0.4)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23CC7A00' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.25em 1.25em',
            paddingRight: '2.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.color = '#202020'
            e.currentTarget.style.borderColor = '#FFA05A'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 160, 90, 0.2)'
            e.currentTarget.style.backgroundImage = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23202020' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFF4E6'
            e.currentTarget.style.color = '#CC7A00'
            e.currentTarget.style.borderColor = 'rgba(255, 160, 90, 0.4)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
            e.currentTarget.style.backgroundImage = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23CC7A00' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
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