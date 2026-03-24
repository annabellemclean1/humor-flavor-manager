'use client'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options: { value: 'light' | 'dark' | 'system'; icon: string; label: string }[] = [
    { value: 'light', icon: '☀️', label: 'Light' },
    { value: 'system', icon: '💻', label: 'System' },
    { value: 'dark', icon: '🌙', label: 'Dark' },
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => setTheme(o.value)}
          title={o.label}
          className={`px-2 py-1 rounded-md text-xs transition-all ${
            theme === o.value
              ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-800 dark:text-stone-100'
              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  )
}