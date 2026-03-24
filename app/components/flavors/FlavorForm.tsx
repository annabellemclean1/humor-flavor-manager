'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { HumorFlavor } from '@/types'

export function FlavorForm({ flavor }: { flavor?: HumorFlavor }) {
  const [name, setName] = useState(flavor?.name ?? '')
  const [description, setDescription] = useState(flavor?.description ?? '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!flavor

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('humor_flavors')
          .update({ name, description, updated_at: new Date().toISOString() })
          .eq('id', flavor.id)
        if (error) throw error
        toast.success('Flavor updated')
        router.refresh()
      } else {
        const { data, error } = await supabase
          .from('humor_flavors')
          .insert({ name, description })
          .select().single()
        if (error) throw error
        toast.success('Flavor created!')
        router.push(`/flavors/${data.id}`)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label className="label">Name</label>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Dry Wit Office Humor"
          required
        />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What style of humor does this flavor produce?"
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading || !name.trim()} className="btn-primary">
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Flavor'}
        </button>
      </div>
    </form>
  )
}