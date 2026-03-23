import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // If "next" is in search params, use it, otherwise go home
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()

    // This part converts the Google "code" into a real user session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // SUCCESS: Send them to the homepage (or whatever 'next' was)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // ERROR: If something went wrong, send them back to login with a message
  return NextResponse.redirect(`${origin}/auth?error=auth-code-error`)
}