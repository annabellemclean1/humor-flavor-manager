import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/ui/Navbar'
import { FlavorCard } from '@/components/flavors/FlavorCard'
import Link from 'next/link'
import type { Profile, HumorFlavor } from '@/types'

export default async function FlavorsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single()

  if (!profile || (!profile.is_superadmin && !profile.is_matrix_admin)) {
    await supabase.auth.signOut()
    redirect('/auth')
  }

  const { data: flavors } = await supabase
    .from('humor_flavors')
    .select('*, humor_flavor_steps(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Navbar profile={profile as Profile} />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
              Humor Flavors
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {flavors?.length ?? 0} flavor{flavors?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/flavors/new" className="btn-primary">
            + New Flavor
          </Link>
        </div>

        {!flavors?.length ? (
          <div className="text-center py-24 text-stone-400 dark:text-stone-600">
            <div className="text-5xl mb-4">🌶️</div>
            <p className="font-medium">No flavors yet</p>
            <p className="text-sm mt-1">Create your first humor flavor to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {flavors.map(f => (
              <FlavorCard key={f.id} flavor={f as HumorFlavor} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}