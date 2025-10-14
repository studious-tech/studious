import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import { ensureUserProfile } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  console.log('🔐 Auth callback hit:', request.url)
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const encodedRedirectTo = requestUrl.searchParams.get('redirect') || '/'
  const redirectTo = decodeURIComponent(encodedRedirectTo)

  console.log('📝 Auth params:', { code: code?.substring(0, 10) + '...', redirectTo })

  const supabase = await createClient()

  try {
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('❌ Error exchanging code for session:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`)
      }
      console.log('✅ Session created successfully for user:', data?.user?.email)

      // Ensure user profile exists
      if (data?.user) {
        await ensureUserProfile(data.user)
      }
    }

    // Successful authentication, redirect to the intended page
    console.log('🔀 Redirecting to:', redirectTo)
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
  } catch (error) {
    console.error('💥 Error during authentication callback:', error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`)
  }
}

