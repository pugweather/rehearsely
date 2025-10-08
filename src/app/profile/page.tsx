"use client"
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCreditCard, faSignOut, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/app/stores/useUserStores'
import { createClient } from '../../../utils/supabase/client'

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<'subscription' | 'logout'>('subscription')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const user = useUserStore((s) => s.user)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut({ scope: 'global' })

    if (error) {
      console.error("Logout error:", error.message)
      setIsLoggingOut(false)
      return
    }

    useUserStore.getState().setUser(null)
    setTimeout(() => {
      router.push('/signin')
    }, 300)
  }

  const handleBack = () => {
    router.back()
  }

  const tabs = [
    {
      id: 'subscription' as const,
      label: 'Manage Subscription',
      icon: faCreditCard
    },
    {
      id: 'logout' as const,
      label: 'Logout',
      icon: faSignOut
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f5f0] to-[#f2e9dc] p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="w-12 h-12 rounded-full border-2 border-black bg-white hover:bg-gray-50 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700" />
          </button>
          <h1 className="text-4xl font-bold text-gray-800">Profile Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className='flex h-[600px] rounded-2xl bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] border-4 border-black shadow-xl overflow-hidden'>
          {/* Left Sidebar - Vertical Tabs */}
          <div className='w-80 bg-gradient-to-b from-[#d4c8b8] to-[#e0d4c4] border-r-2 border-black flex flex-col'>
            {/* Sidebar Header */}
            <div className='p-6 border-b-2 border-black'>
              <h2 className='text-2xl font-bold text-gray-800'>Settings</h2>
              <p className='text-gray-600 mt-1'>{user?.email}</p>
            </div>

            {/* Tabs */}
            <div className='flex-1 p-6'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl border-2 transition-all duration-200 mb-4 text-lg ${
                    activeTab === tab.id
                      ? 'bg-white border-black shadow-md text-gray-800 font-bold'
                      : 'bg-transparent border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className='flex-1 flex flex-col'>
            {/* Content */}
            <div className='flex-1 p-8'>
              {activeTab === 'subscription' && (
                <div className='flex flex-col items-center justify-center h-full text-center'>
                  <div className="w-20 h-20 rounded-full border-3 border-black bg-blue-50 flex items-center justify-center mb-6">
                    <FontAwesomeIcon icon={faCreditCard} className='text-3xl text-blue-600' />
                  </div>
                  <h3 className='text-3xl font-bold text-gray-800 mb-4'>Manage Subscription</h3>
                  <p className='text-gray-600 text-xl max-w-md'>Coming soon! Subscription management features will be available here.</p>
                </div>
              )}

              {activeTab === 'logout' && (
                <div className='flex flex-col items-center justify-center h-full text-center'>
                  <div className="w-20 h-20 rounded-full border-3 border-black bg-red-50 flex items-center justify-center mb-8">
                    <FontAwesomeIcon icon={faSignOut} className='text-3xl text-red-600' />
                  </div>
                  <h3 className='text-3xl font-bold text-gray-800 mb-6'>Log Out</h3>
                  <p className='text-gray-600 text-xl mb-10 max-w-md'>Are you sure you want to log out of your account?</p>
                  
                  <div className='flex items-center gap-6'>
                    <button 
                      onClick={() => setActiveTab('subscription')}
                      className="px-8 py-4 bg-white rounded-xl border-3 border-black font-bold text-gray-700 transition-all duration-200 hover:bg-gray-50 text-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`px-8 py-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl border-3 border-black font-bold transition-all duration-200 flex items-center gap-3 text-lg ${
                        isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoggingOut ? (
                        <>
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Logging out...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSignOut} />
                          <span>Log Out</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
