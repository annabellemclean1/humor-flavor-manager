import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/ui/Navbar'
import { Dashboard } from '@/components/flavors/Dashboard'
import type { Profile } from '@/types'

export default async function Home() {
  const supabase = createServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile || (!profile.is_superadmin && !profile.is_matrix_admin)) {
    await supabase.auth.signOut()
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Navbar profile={profile as Profile} />
      <main>
        <Dashboard profile={profile as Profile} />
      </main>
    </div>
  )
}
