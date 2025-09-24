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
    const [query, setQuery] = useState<string>('')
    const [debouncedQuery, setDebouncedQuery] = useState<string>('')
    // Dropdown state
    const [openedDropdownId, setOpenedDropdownId] = useState<number | null>(null)
    const [dropdownPos, setDropdownPos] = useState<{top: number, right: number} | null>(null)
    // Edit scene name modal state
    const [sceneEditing, setSceneEditing] = useState<Scene | null>(null)
    // Delete scene modal state
    const [sceneDeleting, setSceneDeleting] = useState<Scene  | null>(null)
    // Animation state for filtered scenes
    const [visibleScenes, setVisibleScenes] = useState<Set<number>>(
      new Set(sceneData.map(scene => scene.id)) // Initialize all scenes as visible on first load
    )
    const animationTimeoutRefs = useRef<NodeJS.Timeout[]>([])
    const [isFiltering, setIsFiltering] = useState(false)

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
    
    // Debounce query for smoother animation
    useEffect(() => {
      setIsFiltering(true)

      const timeoutId = setTimeout(() => {
        setDebouncedQuery(query)
        setIsFiltering(false)
      }, 150) // 150ms debounce

      return () => clearTimeout(timeoutId)
    }, [query])

    const filteredScenes = useMemo(() => {
      return scenes.filter(scene => {
        return scene.name?.toLowerCase().includes(debouncedQuery.toLowerCase().trim())
      })
    }, [scenes, debouncedQuery])

    // Animate scene cards when filtering changes
    useEffect(() => {
      // Clear any existing timeouts to prevent race conditions
      animationTimeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      animationTimeoutRefs.current = []

      // Clear visible scenes first
      setVisibleScenes(new Set())

      // If no filtered scenes, don't animate
      if (filteredScenes.length === 0) {
        return
      }

      // Stagger the appearance of filtered scenes with cleanup
      filteredScenes.forEach((scene, index) => {
        const timeout = setTimeout(() => {
          setVisibleScenes(prev => new Set([...prev, scene.id]))
        }, index * 50) // Reduced delay for snappier animation

        animationTimeoutRefs.current.push(timeout)
      })

      // Cleanup function
      return () => {
        animationTimeoutRefs.current.forEach(timeout => clearTimeout(timeout))
        animationTimeoutRefs.current = []
      }
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
    <div className="relative min-h-screen">
      {/* Subtle background accents - very understated */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large, very subtle gradient blobs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#72a4f2]/3 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-bl from-[#ffa05a]/2 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-tr from-[#FFD96E]/2 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <ScenesDashboardHeader onChange={setQuery}/>
        
        <div className={`p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto transition-opacity duration-300 ${
          isFiltering ? 'opacity-50' : 'opacity-100'
        }`}>
          {filteredScenes.map((scene, index) => {
            const isVisible = visibleScenes.has(scene.id)
            return <div
              key={scene.id}
              className={`transition-all duration-500 ease-out transform ${
                isVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 50}ms` : '0ms'
              }}
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

        {/* Clean empty state */}
        {filteredScenes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="text-4xl mb-3 opacity-60">🎭</div>
            <div className="text-xl font-medium text-gray-600 mb-1">No scenes found</div>
            <div className="text-gray-500">Create your first scene to get started</div>
          </div>
        )}
      </div>

      {sceneEditing && <ModalSceneName closeEditNameModal={closeEditNameModal} setSceneEditing={setSceneEditing} setScenes={setScenes} scene={sceneEditing}/>}
      {sceneDeleting && <ModalDeleteScene closeDeleteSceneModal={closeDeleteSceneModal} setSceneDeleting={setSceneDeleting} setScenes={setScenes} scene={sceneDeleting}/>}
    </div>
  )
}

export default ScenesDashboardClient