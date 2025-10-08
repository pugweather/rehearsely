"use client"
import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faChevronDown, faSignOut, faCog } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/app/stores/useUserStores'
import { createClient } from '../../../../utils/supabase/client'
import { useRouter } from 'next/navigation'

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const user = useUserStore((s) => s.user)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut({ scope: 'global' })

    if (error) {
      console.error("Logout error:", error.message)
      return
    }

    useUserStore.getState().setUser(null)
    setTimeout(() => {
      router.push('/signin')
    }, 300)
  }

  const dropdownItems = [
    {
      label: 'Profile Settings',
      icon: faCog,
      onClick: () => {
        setIsOpen(false)
        router.push('/profile')
      }
    },
    {
      label: 'Log Out',
      icon: faSignOut,
      onClick: () => {
        setIsOpen(false)
        handleLogout()
      },
      danger: true
    }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button - Simple circular icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faUser} className="text-gray-700 text-lg" />
      </button>

      {/* Dropdown Menu - Very high z-index */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl border-2 border-black shadow-xl z-[999999]">
          {dropdownItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                index === 0 ? 'rounded-t-xl' : ''
              } ${
                index === dropdownItems.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100'
              } ${
                item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="text-sm" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
