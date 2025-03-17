import React from 'react';
import Navbar from '../components/layout/Navbar';
import ScenesDashboardHeader from '../components/scenes-dashboard/ScenesDashboardHeader';
import SceneCard from '../components/scenes-dashboard/SceneCard';
import { scenes } from '@/database/drizzle/schema';
import db from '../database';
import { useState } from 'react';

const ScenesDashboardPage = async () => {

  const sceneData = await db.select().from(scenes)

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col">
      <Navbar />
      <div className="max-w-[65rem] w-full flex-grow m-auto bg-white">
        <ScenesDashboardHeader/>
        <div className='p-5 grid grid-cols-3 gap-4'>
          {sceneData.map(scene => {
            return <SceneCard key={scene.id} id={scene.id} name={scene.name} modified={scene.modified_at} />
          })}
        </div>
      </div>
    </div>
  )
}

export default ScenesDashboardPage