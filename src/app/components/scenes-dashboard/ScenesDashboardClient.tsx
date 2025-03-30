"use client"
import React, { useState, useMemo, useEffect } from 'react'
import ScenesDashboardHeader from './ScenesDashboardHeader'
import SceneCard from './SceneCard';

type Scene = {
    id: number;
    name: string | null;
    modified_at: string;
    user_id: string;
};

type DropdownData = {
  label: string,
  onClick: () => void,
  className?: string
}

type Props = {
    sceneData: Scene[]
}
  
const ScenesDashboardClient = ({sceneData}: Props) => {

    const [query, setQuery]= useState<string>('')
    const [openedDropdownId, setOpenedDropdownId] = useState<number | null>(null)

    const setDropdownOpened = (sceneId: number) => {
      setOpenedDropdownId(sceneId)
    }
    
    
    // Options for our the scene card dropdowns
    const sceneCardDropdownData: DropdownData[] = [
      {
        label: "Edit Name",
        onClick: () => console.log("launch modal")
      }, {
        label: "Delete",
        onClick: () => console.log("launch modal"),
        className: "text-red-500",
      }
    ]
    
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
            return <SceneCard 
              key={scene.id} 
              id={scene.id} 
              name={scene.name} 
              modified_at={scene.modified_at} 
              user_id={scene.user_id} 
              isDropdownOpen={openedDropdownId === scene.id}
              setDropdownOpened={() => setDropdownOpened(scene.id)}
              dropdownData={sceneCardDropdownData}
              />
          })}
        </div>
    </>
  )
}

export default ScenesDashboardClient