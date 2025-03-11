import React from 'react';
import Navbar from '../components/layout/Navbar';
import ScenesDashboardHeader from '../components/scenes-dashboard/ScenesDashboardHeader';
import SceneCard from '../components/scenes-dashboard/SceneCard';

const mockScenes = [
  {
    id: 1,
    name: "Scene 1",
    modified: "1741581340"
  },
  {
    id: 2,
    name: "Scene 2",
    modified: "1741581340"
  },
  {
    id: 3,
    name: "Scene 3",
    modified: "1741581340"
  },
  {
    id: 4,
    name: "Scene 4",
    modified: "1741581340"
  },
  {
    id: 5,
    name: "Scene 5",
    modified: "1741581340"
  },
  {
    id: 6,
    name: "Scene 6",
    modified: "1741581340"
  },
]

const ScenesDashboardPage = () => {
  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col">
      <Navbar />
      <div className="max-w-[65rem] w-full flex-grow m-auto bg-white">
        <ScenesDashboardHeader/>
        <div className='p-5 grid grid-cols-3 gap-4'>
          {mockScenes.map(scene => {
            return <SceneCard key={scene.id} id={scene.id} name={scene.name} modified={scene.modified} />
          })}
        </div>
      </div>
    </div>
  )
}

export default ScenesDashboardPage