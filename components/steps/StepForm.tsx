'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { HumorFlavorStep, LLMModel, LLMInputType, LLMOutputType, HumorFlavorStepType } from '@/types'

interface StepFormProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  flavorId: number
  step?: HumorFlavorStep | null
  nextOrder: number
  models: LLMModel[]
  inputTypes: LLMInputType[]
  outputTypes: LLMOutputType[]
  stepTypes: HumorFlavorStepType[]
}

export function StepForm({
  open, onClose, onSaved, flavorId, step,
  nextOrder, models, inputTypes, outputTypes, stepTypes,
}: StepFormProps) {
  const supabase = createClient()
  const isEdit = !!step

  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [modelId, setModelId] = useState<number>(models[0]?.id || 1)
  const [inputTypeId, setInputTypeId] = useState<number>(inputTypes[0]?.id || 1)
  const [outputTypeId, setOutputTypeId] = useState<number>(outputTypes[0]?.id || 1)
  const [stepTypeId, setStepTypeId] = useState<number>(stepTypes[0]?.id || 1)
  const [temperature, setTemperature] = useState('0.7')
  const [loading, setLoading] = useState(false)

  const selectedModel = models.find((m) => m.id === modelId)

  useEffect(() => {
    if (step) {
      setDescription(step.description || '')
      setSystemPrompt(step.llm_system_prompt || '')
      setUserPrompt(step.llm_user_prompt || '')
      setModelId(step.llm_model_id)
      setInputTypeId(step.llm_input_type_id)
      setOutputTypeId(step.llm_output_type_id)
      setStepTypeId(step.humor_flavor_step_type_id)
      setTemperature(String(step.llm_temperature ?? 0.7))
    } else {
      setDescription('')
      setSystemPrompt('')
      setUserPrompt('')
      setModelId(models[0]?.id || 1)
      setInputTypeId(inputTypes[0]?.id || 1)
      setOutputTypeId(outputTypes[0]?.id || 1)
      setStepTypeId(stepTypes[0]?.id || 1)
      setTemperature('0.7')
    }
  }, [step, open, models, inputTypes, outputTypes, stepTypes])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        humor_flavor_id: flavorId,
        description: description.trim() || null,
        llm_system_prompt: systemPrompt.trim(),
        llm_user_prompt: userPrompt.trim(),
        llm_model_id: modelId,
        llm_input_type_id: inputTypeId,
        llm_output_type_id: outputTypeId,
        humor_flavor_step_type_id: stepTypeId,
        llm_temperature: parseFloat(temperature),
        order_by: isEdit ? step!.order_by : nextOrder,
      }

      if (isEdit && step) {
        const { error } = await supabase.from('humor_flavor_steps').update(payload).eq('id', step.id)
        if (error) throw error
        toast.success('Step updated')
      } else {
        const { error } = await supabase.from('humor_flavor_steps').insert(payload)
        if (error) throw error
        toast.success('Step added')
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
      title={isEdit ? `Edit Step ${step?.order_by}` : `Add Step ${nextOrder}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Description */}
        <div>
          <label className="label">Step Description <span className="text-stone-400 normal-case font-normal">(optional)</span></label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Describe the image in plain text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Model + Step Type row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">LLM Model</label>
            <select
              className="input"
              value={modelId}
              onChange={(e) => setModelId(Number(e.target.value))}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Step Type</label>
            <select
              className="input"
              value={stepTypeId}
              onChange={(e) => setStepTypeId(Number(e.target.value))}
            >
              {stepTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.description || t.slug}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input / Output types */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Input Type</label>
            <select
              className="input"
              value={inputTypeId}
              onChange={(e) => setInputTypeId(Number(e.target.value))}
            >
              {inputTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.description || t.slug}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Output Type</label>
            <select
              className="input"
              value={outputTypeId}
              onChange={(e) => setOutputTypeId(Number(e.target.value))}
            >
              {outputTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.description || t.slug}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Temperature */}
        {selectedModel?.is_temperature_supported !== false && (
          <div>
            <label className="label">
              Temperature — <span className="font-mono text-brand-500">{parseFloat(temperature).toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>0 — Deterministic</span>
              <span>1 — Balanced</span>
              <span>2 — Creative</span>
            </div>
          </div>
        )}

        {/* System Prompt */}
        <div>
          <label className="label">System Prompt</label>
          <textarea
            className="input resize-none font-mono text-xs"
            rows={4}
            placeholder="You are a helpful assistant that describes images in vivid detail…"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            required
          />
        </div>

        {/* User Prompt */}
        <div>
          <label className="label">User Prompt</label>
          <textarea
            className="input resize-none font-mono text-xs"
            rows={4}
            placeholder="Describe what you see in this image. Focus on the main subjects and any humorous elements…"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            required
          />
          <p className="text-xs text-stone-400 mt-1">
            Use <code className="bg-stone-100 dark:bg-stone-800 px-1 rounded">{'{{input}}'}</code> to reference the previous step's output.
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-stone-100 dark:border-stone-800">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Step'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
