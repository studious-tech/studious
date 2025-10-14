import { redirect } from 'next/navigation'
import { AuthComponent } from '@/components/sections/auth/auth-component'
import { getUser } from '@/lib/auth/session'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const user = await getUser()
  if (user) {
    return redirect('/')
  }

  const params = await searchParams
  const email = params.email || ''

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthComponent mode="signup" initialEmail={email} />
    </Suspense>
  )
}
