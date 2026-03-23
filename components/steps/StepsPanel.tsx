'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { StepCard } from './StepCard'
import { StepForm } from './StepForm'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { HumorFlavorStep, LLMModel, LLMInputType, LLMOutputType, HumorFlavorStepType } from '@/types'

interface StepsPanelProps {
  flavorId: number
  steps: HumorFlavorStep[]
  onStepsChange: () => void
  models: LLMModel[]
  inputTypes: LLMInputType[]
  outputTypes: LLMOutputType[]
  stepTypes: HumorFlavorStepType[]
}

export function StepsPanel({
  flavorId, steps, onStepsChange, models, inputTypes, outputTypes, stepTypes,
}: StepsPanelProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<HumorFlavorStep | null>(null)
  const [activeId, setActiveId] = useState<number | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number)
  }

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = steps.findIndex((s) => s.id === active.id)
      const newIndex = steps.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(steps, oldIndex, newIndex)

      // Optimistic update is handled by parent re-fetch
      // Persist new order_by values
      try {
        const updates = reordered.map((step, i) =>
          supabase
            .from('humor_flavor_steps')
            .update({ order_by: i + 1 })
            .eq('id', step.id)
        )
        const results = await Promise.all(updates)
        const err = results.find((r) => r.error)
        if (err?.error) throw err.error
        toast.success('Order saved')
        onStepsChange()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Reorder failed')
      }
    },
    [steps, supabase, onStepsChange]
  )

  const activeStep = steps.find((s) => s.id === activeId)

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              models={models}
              inputTypes={inputTypes}
              outputTypes={outputTypes}
              stepTypes={stepTypes}
              onEdit={() => { setEditingStep(step); setFormOpen(true) }}
              onDeleted={onStepsChange}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeStep ? (
            <div className="dnd-overlay">
              <StepCard
                step={activeStep}
                index={steps.findIndex((s) => s.id === activeStep.id)}
                models={models}
                inputTypes={inputTypes}
                outputTypes={outputTypes}
                stepTypes={stepTypes}
                onEdit={() => {}}
                onDeleted={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {steps.length === 0 && (
        <div className="text-center py-12 text-stone-400 dark:text-stone-600">
          <div className="text-3xl mb-2">🪜</div>
          <p className="text-sm">No steps yet. Add your first step below.</p>
        </div>
      )}

      <button
        onClick={() => { setEditingStep(null); setFormOpen(true) }}
        className="btn-secondary flex items-center justify-center gap-2 border-dashed border border-stone-300 dark:border-stone-700 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Step {steps.length + 1}
      </button>

      <StepForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingStep(null) }}
        onSaved={onStepsChange}
        flavorId={flavorId}
        step={editingStep}
        nextOrder={steps.length + 1}
        models={models}
        inputTypes={inputTypes}
        outputTypes={outputTypes}
        stepTypes={stepTypes}
      />
    </div>
  )
}
