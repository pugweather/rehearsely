import React from 'react';
import Navbar from '../components/layout/Navbar';
import ScenesDashboardHeader from '../components/scenes-dashboard/ScenesDashboardHeader';
import SceneCard from '../components/scenes-dashboard/SceneCard';

const mockScenes = [
  {
    id: 1,
    name: "Yellowjackets",
    modified: "1741581340"
  },
]

const ScenesDashboardPage = () => {
  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col">
      <Navbar />
      <div className="max-w-4xl w-full flex-grow m-auto bg-white">
        <ScenesDashboardHeader/>
        <div>
          {mockScenes.map(scene => {
            return <SceneCard key={scene.id} id={scene.id} name={scene.name} modified={scene.modified} />
          })}
        </div>
      </div>
    </div>
  )
}

export default ScenesDashboardPage