import React from 'react'

// TODO: convert modified unix timestamp to readable format

interface SceneCardProps {
    id: number;
    name: string;
    modified: string;
  }
  
const SceneCard = ({id, name, modified}: SceneCardProps) => {
  return (
    <div>
      <div>{name}</div>
      <div>1 day ago</div>
    </div>
  )
}

export default SceneCard