import React, { PropsWithChildren } from 'react'

const EditorWrapper = ({children}: PropsWithChildren<{}>) => {
  return (
    <div className="flex-grow max-w-4xl w-full mx-auto px-6 py-8 min-h-full">
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-3xl shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)] p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default EditorWrapper