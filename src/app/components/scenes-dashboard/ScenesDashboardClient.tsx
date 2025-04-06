"use client"
import React, { useState, useMemo, useRef} from 'react'
import ScenesDashboardHeader from './ScenesDashboardHeader'
import SceneCard from './SceneCard';
import Overlay from '../ui/Overlay';
import Dropdown from '../ui/Dropdown';
import ModalSceneName from './ModalSceneName';

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

    // Search filtering state
    const [query, setQuery]= useState<string>('')
    // Dropdown state
    const [openedDropdownId, setOpenedDropdownId] = useState<number | null>(null)
    const [dropdownPos, setDropdownPos] = useState<{top: number, right: number} | null>(null)
    // Edit scename modal state
    const [sceneEditing, setSceneEditing] = useState<Scene | null>(null)

    // Pass to SceneCard component
    const openDropdown = (sceneId: number, ref: React.RefObject<HTMLDivElement | null>) => {

      if (!ref.current) {
        throw new Error("Dropdown button doesn't exist, but should")
      }

      // Position of the dropdown to open
      const dropdownBtn = ref.current?.getBoundingClientRect()
      setDropdownPos({
        top: dropdownBtn.top + window.scrollY + 25,
        right: window.innerWidth - dropdownBtn.right
      })
      // Open the correct dopdown using scene id
      setOpenedDropdownId(sceneId)
    }

    const closeDropdown = () => {
      setOpenedDropdownId(null)
      setDropdownPos(null)
    }

    const closeEditNameModal = () => {
      setSceneEditing(null)
    }
    
    const filteredScenes = useMemo(() => {
      return sceneData.filter(scene => {
        return scene.name?.toLowerCase().includes(query.toLowerCase().trim())
      })
    }, [sceneData, query])

    // Options for our the scene card dropdowns
    const sceneCardDropdownData: DropdownData[] = [
      {
        label: "Edit Name",
        onClick: function() {
          const scene = filteredScenes.find(s => s.id == openedDropdownId)
          if (scene) {
            closeDropdown()
            setSceneEditing(scene)
          }
        }
      }, {
        label: "Delete",
        onClick: function() {

        },
        className: "text-red-500",
      }
    ]

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
              openDropdown={openDropdown}
              closeDropdown={closeDropdown}
              />
          })}
        </div>
        {openedDropdownId && <Overlay closeDropdown={closeDropdown}/>}
        {openedDropdownId && <Dropdown dropdownData={sceneCardDropdownData} dropdownPos={dropdownPos} closeDropdown={closeDropdown}/>}
        {sceneEditing && <ModalSceneName closeEditNameModal={closeEditNameModal} scene={sceneEditing}/>}
    </>
  )
}

export default ScenesDashboardClient