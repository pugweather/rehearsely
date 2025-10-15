"use client"
import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faChevronDown, faSignOut, faCog } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/app/stores/useUserStores'
import { createClient } from '../../../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import localFont from 'next/font/local'

const sunsetSerialMediumFont = localFont({
  src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

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
      },
      gradient: 'from-[#72a4f2] to-[#5a8de8]'
    },
    {
      label: 'Log Out',
      icon: faSignOut,
      onClick: () => {
        setIsOpen(false)
        handleLogout()
      },
      danger: true,
      gradient: 'from-[#ef4444] to-[#dc2626]'
    }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button - Simple circular icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-black transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group"
      >
        <FontAwesomeIcon icon={faUser} className="text-gray-700 group-hover:text-white transition-colors duration-300 text-lg" />
      </button>

      {/* Dropdown Menu - Matching hamburger style with tan gradient */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 w-56 bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl border-4 border-black shadow-2xl z-[999999] overflow-hidden animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-300">
          <div className="p-2">
            {dropdownItems.map((item, index) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 transition-all duration-200 text-left group ${sunsetSerialMediumFont.className}`}
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <FontAwesomeIcon icon={item.icon} className="text-white text-sm" />
                </div>
                <span className={`font-semibold ${item.danger ? 'text-red-700 group-hover:text-red-800' : 'text-gray-800 group-hover:text-[#2c5aa0]'} transition-colors`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
