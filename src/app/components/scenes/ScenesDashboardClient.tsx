"use client"
import React, { useState, useMemo, useRef, useEffect} from 'react'
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
    // Animation state for filtered scenes
    const [visibleScenes, setVisibleScenes] = useState<Set<number>>(new Set())

    console.log(openedDropdownId)

    // Pass to SceneCard component
    const openDropdown = (sceneId: number, ref: React.RefObject<HTMLDivElement | null>) => {

      // if (!ref.current) {
      //   throw new Error("Dropdown button doesn't exist, but should")
      // }

      // // Position of the dropdown to open
      // const dropdownBtn = ref.current?.getBoundingClientRect()
      // setDropdownPos({
      //   top: dropdownBtn.top + window.scrollY + 25,
      //   right: window.innerWidth - dropdownBtn.right
      // })

      // Open the correct dropdown using scene id
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

    // Animate scene cards when filtering changes
    useEffect(() => {
      // Clear visible scenes first
      setVisibleScenes(new Set())
      
      // Stagger the appearance of filtered scenes
      filteredScenes.forEach((scene, index) => {
        setTimeout(() => {
          setVisibleScenes(prev => new Set([...prev, scene.id]))
        }, index * 100)
      })
    }, [filteredScenes])

    // Options for our the scene card dropdowns
    const sceneCardDropdownData: DropdownData[] = [
      {
        label: "Edit Name",
        onClick: function() {
          const scene = filteredScenes.find(s => s.id == openedDropdownId)
          console.log(scene)
          if (scene) {
            closeDropdown()
            setSceneEditing(scene)
          }
        },
        className: ""
      }, {
        label: "Delete",
        onClick: function() {
          const scene = filteredScenes.find(s => s.id === openedDropdownId)
          if (scene) {
            closeDropdown()
            setSceneDeleting(scene)
          }
        },
        className: "color-red",
      }
    ]

  return (
    <>
        <ScenesDashboardHeader onChange={setQuery}/>
        <div className='p-5 grid grid-cols-3 gap-6'>
          {filteredScenes.map(scene => {
            const isVisible = visibleScenes.has(scene.id)
            return <div
              key={scene.id}
              className={`transition-all duration-500 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <SceneCard 
                id={scene.id} 
                name={scene.name} 
                modified_at={scene.modified_at} 
                user_id={scene.user_id} 
                openDropdown={openDropdown}
                closeDropdown={closeDropdown}
                dropdownData={sceneCardDropdownData}
                setOpenedDropdownId={setOpenedDropdownId}
                />
            </div>
          })}
        </div>
        {/* {openedDropdownId && <Overlay closeDropdown={closeDropdown}/>} */}
        {/* {openedDropdownId && <Dropdown dropdownData={sceneCardDropdownData} dropdownPos={dropdownPos} closeDropdown={closeDropdown} className='z-20 px-1 py-1.5 border-b border-b-gray-100 w-35'/>} */}
        {sceneEditing && <ModalSceneName closeEditNameModal={closeEditNameModal} setSceneEditing={setSceneEditing} setScenes={setScenes} scene={sceneEditing}/>}
        {sceneDeleting && <ModalDeleteScene closeDeleteSceneModal={closeDeleteSceneModal} setSceneDeleting={setSceneDeleting} setScenes={setScenes} scene={sceneDeleting}/>}
    </>
  )
}

export default ScenesDashboardClient