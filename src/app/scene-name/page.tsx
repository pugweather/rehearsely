'use client'
import React from 'react'
import Navbar from '../components/layout/Navbar'
import Link from 'next/link'
import ButtonLink from '../components/ui/ButtonLink'

const SceneNamePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className='h-full text-blue-950 flex-grow flex-col flex items-center justify-center'>
          <div className='flex flex-col items-center -mt-15'>
              <h1 className='text-2xl mb-5'>Enter the name for your scene</h1>
              <div className='flex items-center'>
                  <input 
                      type="text" 
                      placeholder="Enter scene name"
                      className="relative w-125 h-15 pl-7.5 mr-4 text-lg border border-gray-300 rounded-3xl outline-none placeholder-gray-400"
                  />
                  <Link href="/editor">
                    <ButtonLink text='Done'></ButtonLink>
                  </Link>
              </div>
          </div>
        </div>
    </div>
  )
}

export default SceneNamePage