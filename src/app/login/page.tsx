'use client'
import { useState } from 'react'
import { login, signup } from './actions'
import Navbar from '../components/layout/Navbar'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/scenes-dashboard`
      }
    })
    if (error) console.error('Google sign-in error:', error.message)
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-main">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded-2xl shadow-md min-w-[25rem] min-h-[25rem] space-y-6 relative overflow-hidden">
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

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                {mode === 'login' ? (
                  <button
                    formAction={login}
                    className="w-full py-2 px-4 bg-[#f47c2c] hover:opacity-85 text-white font-semibold rounded-xl transition"
                  >
                    Log in
                  </button>
                ) : (
                  <button
                    formAction={signup}
                    className="w-full py-2 px-4 bg-[#f47c2c] hover:opacity-85 text-white font-semibold rounded-xl transition"
                  >
                    Sign up
                  </button>
                )}
              </div>

              <div className="text-center text-sm">
                {mode === 'login' ? (
                  <>
                    Don’t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-blue-500 underline"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-blue-500 underline"
                    >
                      Log in
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center mt-4">
                <div className="border-t w-full" />
                <span className="px-4 text-gray-500 text-sm">or</span>
                <div className="border-t w-full" />
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
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
