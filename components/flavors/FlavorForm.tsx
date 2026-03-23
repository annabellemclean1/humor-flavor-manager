'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { HumorFlavor } from '@/types'

interface FlavorFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  flavor?: HumorFlavor | null
}

export function FlavorForm({ open, onClose, onSaved, flavor }: FlavorFormProps) {
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const isEdit = !!flavor

  useEffect(() => {
    if (flavor) {
      setDescription(flavor.description || '')
      setSlug(flavor.slug || '')
      setSlugManual(true)
    } else {
      setDescription('')
      setSlug('')
      setSlugManual(false)
    }
  }, [flavor, open])

  function handleDescriptionChange(val: string) {
    setDescription(val)
    if (!slugManual) setSlug(slugify(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !slug.trim()) return
    setLoading(true)
    try {
      if (isEdit && flavor) {
        const { error } = await supabase
          .from('humor_flavors')
          .update({ description: description.trim(), slug: slug.trim() })
          .eq('id', flavor.id)
        if (error) throw error
        toast.success('Flavor updated')
      } else {
        const { error } = await supabase
          .from('humor_flavors')
          .insert({ description: description.trim(), slug: slug.trim() })
        if (error) throw error
        toast.success('Flavor created')
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Humor Flavor' : 'New Humor Flavor'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Description / Name</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="e.g. Dry British wit with a side of existential dread…"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="label">Slug</label>
          <input
            type="text"
            className="input font-mono text-xs"
            placeholder="dry-british-wit"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
            required
          />
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Auto-generated from description. Used as a unique identifier.
          </p>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Flavor'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
