import React, { PropsWithChildren } from 'react'

const EditorWrapper = ({children}: PropsWithChildren<{}>) => {
  return (
    <div className="flex-grow max-w-[50rem] w-full bg-white mx-auto">
        {children}
    </div>
  )
}

export default EditorWrapper