'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import type { HumorFlavorStep, LLMModel, LLMInputType, LLMOutputType, HumorFlavorStepType } from '@/types'

interface StepCardProps {
  step: HumorFlavorStep
  index: number
  models: LLMModel[]
  inputTypes: LLMInputType[]
  outputTypes: LLMOutputType[]
  stepTypes: HumorFlavorStepType[]
  onEdit: () => void
  onDeleted: () => void
}

export function StepCard({
  step, index, models, inputTypes, outputTypes, stepTypes, onEdit, onDeleted,
}: StepCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const model = models.find((m) => m.id === step.llm_model_id)
  const inputType = inputTypes.find((t) => t.id === step.llm_input_type_id)
  const outputType = outputTypes.find((t) => t.id === step.llm_output_type_id)
  const stepType = stepTypes.find((t) => t.id === step.humor_flavor_step_type_id)

  async function handleDelete() {
    setDeleting(true)
    try {
      const { error } = await supabase.from('humor_flavor_steps').delete().eq('id', step.id)
      if (error) throw error
      toast.success('Step deleted')
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
      <div ref={setNodeRef} style={style} className="step-card group">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="drag-handle mt-0.5 shrink-0 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-semibold shrink-0">
                {index + 1}
              </span>
              {step.description && (
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  {step.description}
                </span>
              )}
              {stepType && (
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-medium">
                  {stepType.slug}
                </span>
              )}
              {model && (
                <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded font-mono">
                  {model.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="btn-ghost p-1.5"
                title="Edit step"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                title="Delete step"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* I/O badges */}
          <div className="flex items-center gap-2 mb-2 text-[10px]">
            {inputType && (
              <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                <span>IN</span>
                <span className="font-mono">{inputType.slug || inputType.description}</span>
              </span>
            )}
            <svg className="w-3 h-3 text-stone-300 dark:text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {outputType && (
              <span className="flex items-center gap-1 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 px-2 py-0.5 rounded border border-green-100 dark:border-green-900">
                <span>OUT</span>
                <span className="font-mono">{outputType.slug || outputType.description}</span>
              </span>
            )}
            {model?.is_temperature_supported && (
              <span className="ml-auto text-stone-400 dark:text-stone-500 font-mono">
                temp {Number(step.llm_temperature).toFixed(2)}
              </span>
            )}
          </div>

          {/* Prompts preview */}
          <div className="space-y-1.5">
            {step.llm_system_prompt && (
              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg px-3 py-2">
                <div className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">System</div>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 font-mono leading-relaxed">
                  {step.llm_system_prompt}
                </p>
              </div>
            )}
            {step.llm_user_prompt && (
              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg px-3 py-2">
                <div className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">User</div>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 font-mono leading-relaxed">
                  {step.llm_user_prompt}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Step"
        message={`Delete step ${index + 1}${step.description ? ` "${step.description}"` : ''}? This cannot be undone.`}
        loading={deleting}
      />
    </>
  )
}
