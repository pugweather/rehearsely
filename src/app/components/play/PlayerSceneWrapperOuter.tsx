import React from 'react'
import { Scene } from '@/app/types'
import { Line } from '@/app/types'
import Navbar from '../layout/Navbar'
import PlayerLineList from './PlayerLineList'

type Props = {
    scene: Scene,
    lineItems: Line[] | null
}

const PlaySceneWrapperOuter = ({scene, lineItems}: Props) => {
  return (
    <div 
        className="min-h-screen bg-gray-100 flex flex-col"
    >
        <Navbar />
        <div className="flex-grow max-w-[50rem] w-full bg-white mx-auto px-6">
          <div className="flex flex-col items-center py-8">
              <div className="max-w-md w-full flex flex-col items-center pb-25">
                  <PlayerLineList 
                      lineItems={lineItems} 
                      sceneId={scene.id}
                  />
              </div>
          </div>
        </div>
    </div>
  )
}

export default PlaySceneWrapperOuter