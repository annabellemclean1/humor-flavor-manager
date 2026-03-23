'use client'

import { useState, useRef } from 'react'
import { processImageFull, processImageFromUrl } from '@/lib/pipeline'
import { extractCaptionText } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import type { HumorFlavor } from '@/types'

interface CaptionTesterProps {
  flavor: HumorFlavor
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic']

type InputMode = 'upload' | 'url'

interface CaptionResult {
  imageUrl: string
  captions: unknown[]
  error?: string
}

export function CaptionTester({ flavor }: CaptionTesterProps) {
  const [mode, setMode] = useState<InputMode>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CaptionResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!SUPPORTED_TYPES.includes(f.type)) {
      toast.error(`Unsupported file type: ${f.type}`)
      return
    }
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setResult(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    if (!SUPPORTED_TYPES.includes(f.type)) {
      toast.error(`Unsupported file type: ${f.type}`)
      return
    }
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setResult(null)
  }

  async function handleGenerate() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { toast.error('Not authenticated'); return }
    const jwt = session.access_token

    setLoading(true)
    setResult(null)
    try {
      if (mode === 'upload') {
        if (!file) { toast.error('Please select an image'); return }
        const { cdnUrl, captions } = await processImageFull(jwt, file)
        setResult({ imageUrl: cdnUrl, captions })
      } else {
        if (!imageUrl.trim()) { toast.error('Please enter an image URL'); return }
        const { captions } = await processImageFromUrl(jwt, imageUrl.trim())
        setResult({ imageUrl: imageUrl.trim(), captions })
      }
      toast.success('Captions generated!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed'
      toast.error(msg)
      setResult({ imageUrl: mode === 'upload' ? previewUrl || '' : imageUrl, captions: [], error: msg })
    } finally {
      setLoading(false)
    }
  }

  function clearAll() {
    setFile(null)
    setPreviewUrl(null)
    setImageUrl('')
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg w-fit">
        {(['upload', 'url'] as InputMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); clearAll() }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === m
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            {m === 'upload' ? '📁 Upload' : '🔗 URL'}
          </button>
        ))}
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          {!file ? (
            <label
              htmlFor="image-upload"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center gap-3 h-36 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl cursor-pointer hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50/30 dark:hover:bg-brand-950/20 transition-all"
            >
              <span className="text-2xl">🖼️</span>
              <div className="text-center">
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Drop image or click to browse</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">JPEG, PNG, WebP, GIF, HEIC</p>
              </div>
            </label>
          ) : (
            <div className="flex items-start gap-3">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-stone-200 dark:border-stone-700 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">{file.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB · {file.type}</p>
                <button onClick={clearAll} className="btn-ghost text-xs mt-2 px-2 py-1">
                  Change image
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="label">Image URL</label>
          <input
            type="url"
            className="input"
            placeholder="https://example.com/funny-cat.jpg"
            value={imageUrl}
            onChange={(e) => { setImageUrl(e.target.value); setResult(null) }}
          />
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || (mode === 'upload' ? !file : !imageUrl.trim())}
        className="btn-primary flex items-center gap-2"
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            Generating captions…
          </>
        ) : (
          <>
            <span>✨</span>
            Generate Captions
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="animate-slide-up">
          {result.error ? (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
              <strong>Error:</strong> {result.error}
            </div>
          ) : result.captions.length === 0 ? (
            <div className="text-center py-8 text-stone-400 dark:text-stone-600 text-sm">
              No captions returned from the API.
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                {result.captions.length} caption{result.captions.length !== 1 ? 's' : ''} generated
              </h4>
              {result.captions.map((caption, i) => (
                <div
                  key={i}
                  className="card p-3 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs flex items-center justify-center font-mono shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                      {extractCaptionText(caption)}
                    </p>
                  </div>
                  {/* Show raw if it's an object with extra fields */}
                  {typeof caption === 'object' && caption !== null && Object.keys(caption as object).length > 2 && (
                    <details className="mt-2">
                      <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600 dark:hover:text-stone-300">
                        Raw JSON
                      </summary>
                      <pre className="text-[10px] bg-stone-50 dark:bg-stone-800 rounded p-2 mt-1 overflow-auto text-stone-500 dark:text-stone-400">
                        {JSON.stringify(caption, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
