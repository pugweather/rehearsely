import { login, signup } from './actions'
import Navbar from '../components/layout/Navbar'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-main">

      <Navbar />

      <div className='flex flex-col items-center justify-center flex-grow'>
        <form className="bg-white p-8 rounded-2xl shadow-md min-w-[25rem] min-h-[25rem] space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800">Sign In</h2>

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

            <div className='mt-10'>
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

            <div className="flex space-x-4 mt-10">
              <button
                formAction={login}
                className="w-full py-2 px-4 bg-[#f47c2c] hover:opacity-85 text-white font-semibold rounded-xl transition"
              >
                Log in
              </button>
              <button
                formAction={signup}
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
              >
                Sign up
              </button>
            </div>
        </form>
      </div>

      
    </div>
  )
}
