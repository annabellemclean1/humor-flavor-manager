import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/ui/Navbar'
import { FlavorForm } from '@/components/flavors/FlavorForm'
import Link from 'next/link'
import type { Profile } from '@/types'

export default async function NewFlavorPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single()

  if (!profile || (!profile.is_superadmin && !profile.is_matrix_admin)) {
    await supabase.auth.signOut()
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Navbar profile={profile as Profile} />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
          <Link href="/flavors" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Flavors</Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 mb-8">
          New Humor Flavor
        </h1>
        <FlavorForm />
      </main>
    </div>
  )
}