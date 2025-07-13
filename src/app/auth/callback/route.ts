import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '../../../../utils/supabase/server'
import db from '@/app/database'
import { users } from '@/database/drizzle/schema'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  if (code) {

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {

      const { data: { user } } = await supabase.auth.getUser()

      console.log(user)

      if (!user || !user.id || !user.user_metadata?.name || !user.email) {
        throw new Error("must pass in all necessary fields to create account")
      }

      console.log(user)

      if (user) {
        await db.insert(users).values({
          id: user.id,
          user_id: user.id,
          created_at: user.created_at,
          name: user.user_metadata?.name ?? 'New User',
          email: user.email,
        }).onConflictDoNothing()
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/error`)
}