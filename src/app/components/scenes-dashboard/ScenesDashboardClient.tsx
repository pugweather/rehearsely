"use client"
import React, { useState, useMemo, useRef} from 'react'
import ScenesDashboardHeader from './ScenesDashboardHeader'
import SceneCard from './SceneCard';
import Overlay from '../ui/Overlay';
import Dropdown from '../ui/Dropdown';

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
    const [dropdownPos, setDropdownPos] = useState<{top: number, right: number} | null>()

    const setDropdownOpened = (sceneId: number) => {
      setOpenedDropdownId(sceneId)
    }

    const closeDropdown = () => {
      setOpenedDropdownId(null)
    }

    const openDropdown = (sceneId: number, ref: React.RefObject<HTMLDivElement>) => {

      if (!ref.current) {
        throw new Error("Dropdown button doesn't exist, but should")
      }

      // Position of the dropdown to open
      const dropdownBtn = ref.current?.getBoundingClientRect()
      setDropdownPos({
        top: dropdownBtn.top,
        right: dropdownBtn.right
      })
      // Open the correct dopdown using scene id
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
              openDropdown={openDropdown}
              closeDropdown={closeDropdown}
              dropdownData={sceneCardDropdownData}
              />
          })}
        </div>
        {openedDropdownId && <Overlay zIndex={"z-40"} closeDropdown={closeDropdown}/>}
        {openedDropdownId && <Dropdown dropdownData={sceneCardDropdownData} closeDropdown={closeDropdown}/>}
    </>
  )
}

export default ScenesDashboardClient