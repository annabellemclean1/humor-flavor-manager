import { redirect, notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { Navbar } from '@/components/ui/Navbar'
import { FlavorForm } from '@/components/flavors/FlavorForm'
import { StepsPanel } from '@/components/steps/StepsPanel'
import Link from 'next/link'
import type { Profile, HumorFlavor, HumorFlavorStep } from '@/types'

export default async function FlavorDetailPage({ params }: { params: { id: string } }) {
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

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Navbar profile={profile as Profile} />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-stone-400 mb-4">
            <Link href="/flavors" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">Flavors</Link>
            <span>/</span>
            <span className="text-stone-600 dark:text-stone-300">{flavor.name}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
              {flavor.name}
            </h1>
            <Link href={`/flavors/${flavor.id}/test`} className="btn-primary shrink-0">
              🧪 Test Flavor
            </Link>
          </div>
        </div>

        <section>
          <h2 className="label mb-3">Flavor Details</h2>
          <FlavorForm flavor={flavor as HumorFlavor} />
        </section>

        <section>
          <h2 className="label mb-3">Prompt Steps</h2>
          <StepsPanel flavorId={flavor.id} steps={steps} />
        </section>
      </main>
    </div>
  )
}