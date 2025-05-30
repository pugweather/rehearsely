"use client"
import React, { useState, useMemo, useRef} from 'react'
import ScenesDashboardHeader from './ScenesDashboardHeader'
import SceneCard from './SceneCard';
import Overlay from '../ui/Overlay';
import Dropdown from '../ui/Dropdown';
import ModalSceneName from './ModalSceneName';
import ModalDeleteScene from './ModalDeleteScene';
import { Scene, DropdownData } from '@/app/types';

type Props = {
    sceneData: Scene[]
}
  
const ScenesDashboardClient = ({sceneData}: Props) => {

    console.log("test")

    const [scenes, setScenes] = useState<Scene[]>(sceneData)
    // Search filtering state
    const [query, setQuery]= useState<string>('')
    // Dropdown state
    const [openedDropdownId, setOpenedDropdownId] = useState<number | null>(null)
    const [dropdownPos, setDropdownPos] = useState<{top: number, right: number} | null>(null)
    // Edit scene name modal state
    const [sceneEditing, setSceneEditing] = useState<Scene | null>(null)
    // Delete scene modal state
    const [sceneDeleting, setSceneDeleting] = useState<Scene  | null>(null)

    console.log(scenes)

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

    const closeDeleteSceneModal = () => {
      setSceneDeleting(null)
    }
    
    const filteredScenes = useMemo(() => {
      return scenes.filter(scene => {
        return scene.name?.toLowerCase().includes(query.toLowerCase().trim())
      })
    }, [scenes, query])

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
          console.log("test")
          const scene = filteredScenes.find(s => s.id === openedDropdownId)
          if (scene) {
            closeDropdown()
            setSceneDeleting(scene)
          }
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
        {openedDropdownId && <Dropdown dropdownData={sceneCardDropdownData} dropdownPos={dropdownPos} closeDropdown={closeDropdown} className='z-20'/>}
        {sceneEditing && <ModalSceneName closeEditNameModal={closeEditNameModal} setSceneEditing={setSceneEditing} setScenes={setScenes} scene={sceneEditing}/>}
        {sceneDeleting && <ModalDeleteScene closeDeleteSceneModal={closeDeleteSceneModal} setSceneDeleting={setSceneDeleting} setScenes={setScenes} scene={sceneDeleting}/>}
    </>
  )
}

export default ScenesDashboardClient