'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import type { HumorFlavor } from '@/types'

interface FlavorCardProps {
  flavor: HumorFlavor
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDeleted: () => void
  stepCount: number
}

export function FlavorCard({
  flavor,
  isSelected,
  onSelect,
  onEdit,
  onDeleted,
  stepCount,
}: FlavorCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  async function handleDelete() {
    setDeleting(true)
    try {
      const { error } = await supabase.from('humor_flavors').delete().eq('id', flavor.id)
      if (error) throw error
      toast.success('Flavor deleted')
      onDeleted()
      setConfirmOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div
        className={`group card p-4 cursor-pointer transition-all duration-150 hover:border-brand-300 dark:hover:border-brand-700 ${
          isSelected
            ? 'border-brand-400 dark:border-brand-600 bg-brand-50/50 dark:bg-brand-950/20 shadow-sm'
            : ''
        }`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded">
                {flavor.slug}
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">
                {stepCount} {stepCount === 1 ? 'step' : 'steps'}
              </span>
            </div>
            <p className="text-sm text-stone-700 dark:text-stone-300 line-clamp-2 leading-snug">
              {flavor.description}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="btn-ghost p-1.5"
              title="Edit flavor"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
              title="Delete flavor"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {isSelected && (
          <div className="mt-2 flex items-center gap-1 text-brand-600 dark:text-brand-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium">Selected</span>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Flavor"
        message={`Delete "${flavor.description}"? All steps will also be deleted. This cannot be undone.`}
        loading={deleting}
      />
    </>
  )
}
