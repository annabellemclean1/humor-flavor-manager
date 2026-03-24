'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { HumorFlavor } from '@/types'

export function FlavorCard({ flavor }: { flavor: HumorFlavor }) {
  const router = useRouter()
  const supabase = createClient()
  const stepCount = flavor.humor_flavor_steps?.length ?? 0

  async function handleDelete() {
    if (!confirm(`Delete "${flavor.name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('humor_flavors').delete().eq('id', flavor.id)
    if (error) toast.error(error.message)
    else { toast.success('Flavor deleted'); router.refresh() }
  }

  return (
    <div className="card p-5 flex items-center justify-between gap-4 group hover:border-stone-300 dark:hover:border-stone-700 transition-all">
      <div className="flex-1 min-w-0">
        <Link href={`/flavors/${flavor.id}`}>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 hover:text-brand-500 transition-colors truncate">
            {flavor.name}
          </h3>
        </Link>
        {flavor.description && (
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            {flavor.description}
          </p>
        )}
        <p className="text-xs text-stone-400 dark:text-stone-600 mt-1">
          {stepCount} step{stepCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/flavors/${flavor.id}/test`} className="btn-primary text-xs px-3 py-1.5">
          🧪 Test
        </Link>
        <Link href={`/flavors/${flavor.id}`} className="btn-secondary text-xs px-3 py-1.5">
          Edit
        </Link>
        <button onClick={handleDelete} className="btn-danger text-xs px-3 py-1.5">
          Delete
        </button>
      </div>
    </div>
  )
}