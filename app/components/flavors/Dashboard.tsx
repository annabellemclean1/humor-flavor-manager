import Link from 'next/link'
import type { Profile } from '@/types'

export function Dashboard({ profile }: { profile: Profile }) {
  const name = profile.email?.split('@')[0] ?? 'there'
  const badge = profile.is_superadmin ? 'Superadmin' : 'Matrix Admin'

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          {badge}
        </div>
        <h1 className="font-display text-4xl font-bold text-stone-900 dark:text-stone-100">
          Hey, {name} 👋
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-lg">
          Build and test humor flavor prompt chains.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/flavors" className="card p-6 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-150 group hover:shadow-md">
          <div className="text-3xl mb-3">🌶️</div>
          <h2 className="font-display font-bold text-stone-900 dark:text-stone-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            Humor Flavors
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            View, edit, and manage all flavor prompt chains.
          </p>
        </Link>

        <Link href="/flavors/new" className="card p-6 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-150 group hover:shadow-md">
          <div className="text-3xl mb-3">✨</div>
          <h2 className="font-display font-bold text-stone-900 dark:text-stone-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            New Flavor
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Design a new multi-step humor pipeline from scratch.
          </p>
        </Link>
      </div>
    </div>
  )
}