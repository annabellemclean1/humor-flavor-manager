'use client'
import { useState } from 'react'
import { StepForm } from './StepForm'
import type { HumorFlavorStep } from '@/types'

interface Props {
  step: HumorFlavorStep
  isFirst: boolean
  isLast: boolean
  onUpdate: (step: HumorFlavorStep) => void
  onDelete: (id: string) => void
  onMove: (step: HumorFlavorStep, dir: 'up' | 'down') => void
}

export function StepCard({ step, isFirst, isLast, onUpdate, onDelete, onMove }: Props) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className="card p-4 animate-slide-up">
        <StepForm
          flavorId={step.flavor_id}
          step={step}
          nextOrder={step.step_order}
          onDone={updated => { onUpdate(updated); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="step-card group">
      <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
        <button
          onClick={() => onMove(step, 'up')}
          disabled={isFirst}
          className="w-6 h-5 flex items-center justify-center text-stone-300 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-20 transition-colors text-xs leading-none"
          title="Move up"
        >▲</button>
        <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-brand-500 font-mono">
          {step.step_order}
        </span>
        <button
          onClick={() => onMove(step, 'down')}
          disabled={isLast}
          className="w-6 h-5 flex items-center justify-center text-stone-300 hover:text-stone-600 dark:hover:text-stone-300 disabled:opacity-20 transition-colors text-xs leading-none"
          title="Move down"
        >▼</button>
      </div>

      <p className="flex-1 text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
        {step.prompt}
      </p>

      <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="btn-secondary text-xs px-2.5 py-1">Edit</button>
        <button onClick={() => onDelete(step.id)} className="btn-danger text-xs px-2.5 py-1">Delete</button>
      </div>
    </div>
  )
}