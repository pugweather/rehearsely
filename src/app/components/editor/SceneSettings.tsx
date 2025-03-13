import React from 'react'
import DelayDropdown from './DelayDropdown'
import Switch from '../ui/Switch'

const SceneSettings = () => {
  return (
    <div className='flex justify-end w-full py-6'>
        <DelayDropdown />
        <div className='flex ml-4'>
            <div className='mr-2'>Teleprompter</div>
            <Switch />
        </div>
    </div>  
  )
}

export default SceneSettings