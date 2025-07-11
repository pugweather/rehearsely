'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from "next/navigation";
import {signInWithGoogle} from './actions'
import Navbar from '../components/layout/Navbar'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from "@/app/stores/useUserStores";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const router = useRouter()
  const pathname = usePathname()

  // const signInWithGoogle = async () => {
  //   console.log("sign in with google")
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: {
  //       redirectTo: `${window.location.origin}/`
  //     }
  //   })
  //   if (error) console.error('Google sign-in error:', error.message)
  // }

  async function handleSignIn() {
    const { url } = await signInWithGoogle("/scenes-dashboard")
    if (url) {
      window.location.href = url
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-main">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded-2xl shadow-md min-w-[25rem] min-h-[10rem] space-y-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -100 : 100 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold text-center text-gray-800">
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </h2>

              <button
                type="button"
                onClick={handleSignIn}
                className="w-full py-2 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition"
              >
                Continue with Google
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
