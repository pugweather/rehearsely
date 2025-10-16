import React, { PropsWithChildren } from 'react'

const EditorWrapper = ({children}: PropsWithChildren<{}>) => {
  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-6 py-8">
      <div className="pl-8 pt-8 pr-8 pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default EditorWrapper