"use client"
import React, { useState, useMemo } from 'react'
import ScenesDashboardHeader from './ScenesDashboardHeader'
import SceneCard from './SceneCard';

type Scene = {
    id: number;
    name: string | null;
    modified_at: string;
    user_id: string;
  };

type Props = {
    sceneData: Scene[]
}
  
const ScenesDashboardClient = ({sceneData}: Props) => {

    const [query, setQuery]= useState('')

    const filteredScenes = useMemo(() => {
        return sceneData.filter(scene => {
            return scene.name?.toLowerCase().includes(query.toLowerCase().trim())
        })
    }, [sceneData, query])

  return (
    <>
        <ScenesDashboardHeader onChange={setQuery}/>
        <div className='p-5 grid grid-cols-3 gap-4'>
          {filteredScenes.map(scene => {
            return <SceneCard key={scene.id} id={scene.id} name={scene.name} modified_at={scene.modified_at} user_id={scene.user_id} />
          })}
        </div>
    </>
  )
}

export default ScenesDashboardClient