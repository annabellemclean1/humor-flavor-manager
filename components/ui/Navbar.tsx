'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ThemeToggle } from './ThemeToggle'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'

export function Navbar({ profile }: { profile: Profile }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/auth')
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/flavors', label: 'Flavors' },
  ]

  return (
    <nav className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-stone-900 dark:text-stone-100 text-sm">
            <span className="text-lg">🌶️</span>
            <span className="hidden sm:block">Humor Flavor Tool</span>
          </Link>
          <div className="flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors font-medium ${
                  pathname === link.href
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden sm:block text-xs text-stone-400 dark:text-stone-500 truncate max-w-32">
            {profile.email}
          </span>
          <button onClick={handleSignOut} className="btn-ghost text-xs">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}