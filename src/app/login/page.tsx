'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from "next/navigation";
import {signInWithGoogle} from './actions'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from "@/app/stores/useUserStores";
import Image from 'next/image';

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
    const { url } = await signInWithGoogle("/scenes")
    console.log(url)
    if (url) {
      window.location.href = url
    }
  }

  return (
    <div className="flex flex-col items-center relative overflow-hidden">
      {/* Background with theatrical gradient accents */}
      <div className="absolute inset-0"></div>

      {/* Subtle background accents matching scenes dashboard */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#72a4f2]/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-bl from-[#ffa05a]/6 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-gradient-to-tr from-[#FFD96E]/6 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full">
        <div className="flex flex-col items-center justify-center flex-grow min-h-[calc(100vh-120px)] px-6 -mt-12">
          {/* Main sign-in card with offset shadow technique */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group relative cursor-default"
          >
            {/* Enhanced offset shadow layer */}
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-4 border-black bg-gradient-to-br from-[#72a4f2] to-[#5a8de8] group-hover:translate-x-4 group-hover:translate-y-4 transition-all duration-300 ease-out"></div>

            {/* Main card */}
            <div className="relative z-10 bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl border-4 border-black p-10 min-w-[28rem] group-hover:shadow-xl transition-all duration-300 ease-out">

              {/* Subtle highlight on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative z-10 space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-8"
                  >
                    {/* Title with theatrical flair */}
                    <div className="text-center space-y-3">
                      <div className="text-5xl mb-2">🎭</div>
                      <h1 className="text-4xl font-bold text-black tracking-tight">
                        Welcome to Rehearsely
                      </h1>
                      <p className="text-lg text-gray-600 font-medium">
                        Your AI scene partner awaits
                      </p>
                    </div>

                    {/* Google Sign-in Button with enhanced styling */}
                    <button
                      type="button"
                      onClick={handleSignIn}
                      className="group/btn w-full py-4 px-6 flex justify-center items-center bg-white hover:bg-gray-50 border-3 border-black rounded-xl text-gray-800 font-semibold text-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* Subtle shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500"></div>

                      <div className='relative min-w-8 min-h-8 mr-4'>
                        <Image
                          src="/google-icon.png"
                          alt="google icon"
                          fill
                          style={{objectFit: "contain"}}
                        />
                      </div>
                      <span className="relative z-10">Continue with Google</span>
                    </button>

                    {/* Decorative accent dots */}
                    <div className="flex justify-center space-x-2 pt-4">
                      <div className="w-3 h-3 bg-[#72a4f2] rounded-full opacity-70"></div>
                      <div className="w-3 h-3 bg-[#ffa05a] rounded-full opacity-50"></div>
                      <div className="w-3 h-3 bg-[#FFD96E] rounded-full opacity-40"></div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
