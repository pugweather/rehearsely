import React from 'react'
import DelayDropdown from './DelayDropdown'
import Switch from '../ui/Switch'

const SceneSettings = () => {
  return (
    <div className='flex items-center gap-6'>
      <DelayDropdown />
      <div className='flex items-center gap-3'>
        <label className='text-sm font-medium' style={{color: '#202020'}}>Teleprompter</label>
        <Switch />
      </div>
    </div>  
  )
}

export default SceneSettings