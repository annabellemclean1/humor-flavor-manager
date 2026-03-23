'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { Profile } from '@/types'

interface NavbarProps {
  profile: Profile | null
}

export function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/auth')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/30">
            <span className="text-sm">🌶️</span>
          </div>
          <span className="font-display font-semibold text-stone-900 dark:text-stone-100 text-sm">
            Humor Flavor Tool
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {profile && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold">
                  {profile.first_name?.[0] || profile.email?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-xs text-stone-600 dark:text-stone-400">
                  {profile.first_name || profile.email}
                </span>
                {profile.is_superadmin && (
                  <span className="text-[10px] bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded font-medium">
                    superadmin
                  </span>
                )}
                {profile.is_matrix_admin && !profile.is_superadmin && (
                  <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium">
                    matrix admin
                  </span>
                )}
              </div>
              <button onClick={handleSignOut} className="btn-ghost text-xs">
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
