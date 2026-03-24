'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { HumorFlavorStep } from '@/types'

interface Props {
  flavorId: string
  step?: HumorFlavorStep
  nextOrder: number
  onDone: (step: HumorFlavorStep) => void
  onCancel: () => void
}

export function StepForm({ flavorId, step, nextOrder, onDone, onCancel }: Props) {
  const [prompt, setPrompt] = useState(step?.prompt ?? '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const isEdit = !!step

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        const { data, error } = await supabase
          .from('humor_flavor_steps')
          .update({ prompt, updated_at: new Date().toISOString() })
          .eq('id', step.id)
          .select().single()
        if (error) throw error
        toast.success('Step updated')
        onDone(data as HumorFlavorStep)
      } else {
        const { data, error } = await supabase
          .from('humor_flavor_steps')
          .insert({ flavor_id: flavorId, step_order: nextOrder, prompt })
          .select().single()
        if (error) throw error
        toast.success('Step added')
        onDone(data as HumorFlavorStep)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving step')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3 items-start">
        <span className="mt-2.5 w-6 h-6 flex items-center justify-center text-xs font-bold text-brand-500 shrink-0 font-mono">
          {isEdit ? step.step_order : nextOrder}
        </span>
        <textarea
          className="input flex-1 resize-none"
          rows={4}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder='e.g. "Look at this image and describe what you see in one paragraph."'
          autoFocus
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={loading || !prompt.trim()} className="btn-primary">
          {loading ? 'Saving...' : isEdit ? 'Update Step' : 'Add Step'}
        </button>
      </div>
    </form>
  )
}