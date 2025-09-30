"use server"
import { createClient } from "../../../utils/supabase/server"

export async function signInWithGoogle(redirectTo: string) {
  const supabase = await createClient()

  // Get the correct port dynamically
  const baseURL = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
    : 'http://localhost:3000' // Use 3000 for dev port

  const redirectURL = `${baseURL}/auth/callback?next=${redirectTo}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectURL,
    }
  })
  if (error) throw error
  return data
}
// import { revalidatePath } from 'next/cache'
// import { redirect } from 'next/navigation'
// import { createClient } from '../../../utils/supabase/server'
// import { useUserStore } from '../stores/useUserStores'

// export async function login(formData: FormData) {
//   console.log("LOGIN!")
//   const supabase = await createClient()

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const userData = {
//     email: formData.get('email') as string,
//     password: formData.get('password') as string,
//   }

//   const { data, error } = await supabase.auth.signInWithPassword(userData)
//   console.log(data)

//   if (error) {
//     redirect('/error')
//   } else {
//     useUserStore.getState().setUser(data.user)
//     console.log("SIGNED IN!")
//     console.log(data.user)
//     console.log(useUserStore.getState().user)
//     redirect('/')
//   }

// }

// export async function signup(formData: FormData) {
//   const supabase = await createClient()

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const data = {
//     email: formData.get('email') as string,
//     password: formData.get('password') as string,
//   }

//   console.log(data)

//   const { error } = await supabase.auth.signUp(data)

//   if (error) {
//     console.log("error")
//     redirect('/error')
//   } else {
//     redirect('/')
//   }
// }