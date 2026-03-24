'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { StepCard } from './StepCard'
import { StepForm } from './StepForm'
import toast from 'react-hot-toast'
import type { HumorFlavorStep } from '@/types'

export function StepsPanel({ flavorId, steps: initial }: { flavorId: string; steps: HumorFlavorStep[] }) {
  const [steps, setSteps] = useState(initial)
  const [addingNew, setAddingNew] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleMove(step: HumorFlavorStep, dir: 'up' | 'down') {
    const idx = steps.findIndex(s => s.id === step.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= steps.length) return
    const other = steps[swapIdx]

    const updated = steps.map(s => {
      if (s.id === step.id) return { ...s, step_order: other.step_order }
      if (s.id === other.id) return { ...s, step_order: step.step_order }
      return s
    }).sort((a, b) => a.step_order - b.step_order)
    setSteps(updated)

    const [r1, r2] = await Promise.all([
      supabase.from('humor_flavor_steps').update({ step_order: other.step_order }).eq('id', step.id),
      supabase.from('humor_flavor_steps').update({ step_order: step.step_order }).eq('id', other.id),
    ])
    if (r1.error || r2.error) {
      toast.error('Failed to reorder')
      setSteps(initial)
    }
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this step?')) return
    const { error } = await supabase.from('humor_flavor_steps').delete().eq('id', id)
    if (error) return toast.error(error.message)
    setSteps(steps.filter(s => s.id !== id))
    toast.success('Step deleted')
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {steps.length === 0 && !addingNew && (
        <p className="text-sm text-stone-400 dark:text-stone-600 text-center py-8 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
          No steps yet — add your first step below.
        </p>
      )}

      {steps.map((step, idx) => (
        <StepCard
          key={step.id}
          step={step}
          isFirst={idx === 0}
          isLast={idx === steps.length - 1}
          onUpdate={updated => setSteps(steps.map(s => s.id === updated.id ? updated : s))}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      ))}

      {addingNew ? (
        <div className="card p-4 animate-slide-up">
          <StepForm
            flavorId={flavorId}
            nextOrder={steps.length + 1}
            onDone={newStep => { setSteps([...steps, newStep]); setAddingNew(false); router.refresh() }}
            onCancel={() => setAddingNew(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-800 text-stone-400 hover:border-brand-400 hover:text-brand-500 transition-colors text-sm font-medium"
        >
          + Add Step
        </button>
      )}
    </div>
  )
}