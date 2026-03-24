'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { runFlavor } from '@/lib/pipeline'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import type { HumorFlavor, HumorFlavorStep, CaptionResult } from '@/types'

const UPLOAD_STEPS = [
  'Getting upload URL...',
  'Uploading image...',
  'Registering image...',
  'Generating captions...',
]

interface Props {
  flavor: HumorFlavor
  steps: HumorFlavorStep[]
  pastResults: CaptionResult[]
}

export function CaptionTester({ flavor, steps, pastResults }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadStep, setUploadStep] = useState<number | null>(null)
  const [results, setResults] = useState<CaptionResult[]>(pastResults)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const hasSteps = steps.length > 0
  const loading = uploadStep !== null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function handleRun() {
    if (!file) return toast.error('Select an image first')
    if (!hasSteps) return toast.error('Add steps to this flavor first')

    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return toast.error('Not authenticated')

    try {
      setUploadStep(0)

      const captions = await runFlavor(file, steps, session.access_token)

      setUploadStep(3)

      const { data, error } = await supabase
        .from('caption_results')
        .insert({
          flavor_id: flavor.id,
          image_url: previewUrl ?? '',
          captions,
        })
        .select().single()

      if (error) throw error
      setResults([data as CaptionResult, ...results])
      toast.success(`${captions.length} caption${captions.length !== 1 ? 's' : ''} generated!`)

      setFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate captions')
    } finally {
      setUploadStep(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step summary */}
      <div className="card p-5">
        <h2 className="label mb-3">Prompt Chain — {steps.length} step{steps.length !== 1 ? 's' : ''}</h2>
        {!hasSteps ? (
          <p className="text-sm text-stone-400">
            No steps configured.{' '}
            <a href={`/flavors/${flavor.id}`} className="text-brand-500 hover:underline">Add steps first.</a>
          </p>
        ) : (
          <ol className="space-y-2">
            {steps.map(step => (
              <li key={step.id} className="flex gap-3 text-sm">
                <span className="font-bold text-brand-500 shrink-0 font-mono w-4">{step.step_order}.</span>
                <span className="text-stone-600 dark:text-stone-400 leading-relaxed">{step.prompt}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Image upload */}
      <div className="card p-5 space-y-4">
        <h2 className="label">Test Image</h2>

        <div
          onClick={() => !loading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-sm
            ${previewUrl ? 'border-brand-300 dark:border-brand-700 p-2' : 'border-stone-200 dark:border-stone-800 hover:border-brand-400 hover:text-brand-500 p-10 text-stone-400'}
            ${loading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
          ) : (
            <>
              <span className="text-2xl">🖼️</span>
              <span>Click to upload an image</span>
              <span className="text-xs text-stone-400">JPG, PNG, WEBP</span>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {previewUrl && !loading && (
          <button
            onClick={() => { setFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
            className="btn-ghost text-xs w-full"
          >
            Clear image
          </button>
        )}

        {/* Progress indicator */}
        {loading && uploadStep !== null && (
          <div className="space-y-2">
            {UPLOAD_STEPS.map((label, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${
                i < uploadStep ? 'text-brand-500' :
                i === uploadStep ? 'text-stone-700 dark:text-stone-300 font-medium' :
                'text-stone-300 dark:text-stone-700'
              }`}>
                <span>{i < uploadStep ? '✓' : i === uploadStep ? '⟳' : '○'}</span>
                {label}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleRun}
          disabled={loading || !hasSteps || !file}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
        >
          {loading ? <><Spinner className="w-4 h-4" /> {UPLOAD_STEPS[uploadStep ?? 0]}</> : '🚀 Run Flavor'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="label">Caption Results</h2>
          {results.map(result => (
            <div key={result.id} className="card p-5 space-y-3 animate-slide-up">
              <p className="text-xs text-stone-400">{new Date(result.created_at).toLocaleString()}</p>
              <ol className="space-y-2">
                {(result.captions ?? []).map((caption: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-brand-500 font-bold font-mono shrink-0">{i + 1}.</span>
                    <span className="text-stone-700 dark:text-stone-300 leading-relaxed">{caption}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}