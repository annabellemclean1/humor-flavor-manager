import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/ui/Navbar'
import { CaptionTester } from '@/components/captions/CaptionTester'
import Link from 'next/link'
import type { Profile, HumorFlavor, HumorFlavorStep, CaptionResult } from '@/types'

export default async function TestFlavorPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single()

  if (!profile || (!profile.is_superadmin && !profile.is_matrix_admin)) {
    await supabase.auth.signOut()
    redirect('/auth')
  }

  const { data: flavor } = await supabase
    .from('humor_flavors')
    .select('*, humor_flavor_steps(*)')
    .eq('id', params.id)
    .single()

  if (!flavor) notFound()

  const steps: HumorFlavorStep[] = (flavor.humor_flavor_steps ?? [])
    .sort((a: HumorFlavorStep, b: HumorFlavorStep) => a.step_order - b.step_order)

  const { data: pastResults } = await supabase
    .from('caption_results')
    .select('*')
    .eq('flavor_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Navbar profile={profile as Profile} />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-stone-400 mb-4">
            <Link href="/flavors" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Flavors</Link>
            <span>/</span>
            <Link href={`/flavors/${flavor.id}`} className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">{flavor.name}</Link>
            <span>/</span>
            <span>Test</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
            Test: {flavor.name}
          </h1>
        </div>
        <CaptionTester
          flavor={flavor as HumorFlavor}
          steps={steps}
          pastResults={(pastResults ?? []) as CaptionResult[]}
        />
      </main>
    </div>
  )
}