import React from 'react'

const DelayDropdown = () => {
  return (
    <div className='font-medium'>
        <label htmlFor="delay-dropdown" className='mr-3'>Delay</label>
        <select name="delay dropdown" id="delay-dropdown" className='pr-1'>
            <option value="3">3s</option>
            <option value="5">5s</option>
            <option value="10">10s</option>
            <option value="15">15s</option>
        </select>
    </div>
    

  )
}

export default DelayDropdown