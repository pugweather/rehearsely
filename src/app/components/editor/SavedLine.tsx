import React from 'react'

type DraftLine = {
  character_id: number | null,
  id: number | null,
  order: number | null,
  scene_id: number | null,
  text: string | null,
  isNew?: boolean
};

type Props = {
  line: DraftLine | null
}

const SavedLine = ({line}: Props) => {

  if (line == null) return

  return (
    <div className='text-center uppercase mb-12.5' style={{ fontFamily: '"Courier Prime' }}>
        <div className='text-lg'>Jessica (you)</div>
        <div className='text-md'>{line.text}</div>
    </div>
  )
}

export default SavedLine