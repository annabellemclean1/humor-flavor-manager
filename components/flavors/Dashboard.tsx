'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { FlavorCard } from '@/components/flavors/FlavorCard'
import { FlavorForm } from '@/components/flavors/FlavorForm'
import { StepsPanel } from '@/components/steps/StepsPanel'
import { CaptionTester } from '@/components/captions/CaptionTester'
import { Spinner } from '@/components/ui/Spinner'
import type {
  Profile, HumorFlavor, HumorFlavorStep,
  LLMModel, LLMInputType, LLMOutputType, HumorFlavorStepType
} from '@/types'

interface DashboardProps {
  profile: Profile
}

type RightPanel = 'steps' | 'test'

export function Dashboard({ profile }: DashboardProps) {
  const supabase = createClient()

  const [flavors, setFlavors] = useState<HumorFlavor[]>([])
  const [steps, setSteps] = useState<HumorFlavorStep[]>([])
  const [selectedFlavor, setSelectedFlavor] = useState<HumorFlavor | null>(null)
  const [editingFlavor, setEditingFlavor] = useState<HumorFlavor | null>(null)
  const [flavorFormOpen, setFlavorFormOpen] = useState(false)
  const [rightPanel, setRightPanel] = useState<RightPanel>('steps')

  // Lookup tables
  const [models, setModels] = useState<LLMModel[]>([])
  const [inputTypes, setInputTypes] = useState<LLMInputType[]>([])
  const [outputTypes, setOutputTypes] = useState<LLMOutputType[]>([])
  const [stepTypes, setStepTypes] = useState<HumorFlavorStepType[]>([])

  const [loadingFlavors, setLoadingFlavors] = useState(true)
  const [loadingSteps, setLoadingSteps] = useState(false)
  const [loadingLookups, setLoadingLookups] = useState(true)

  // Load lookup tables once
  useEffect(() => {
    async function loadLookups() {
      const [m, it, ot, st] = await Promise.all([
        supabase.from('llm_models').select('*').order('id'),
        supabase.from('llm_input_types').select('*').order('id'),
        supabase.from('llm_output_types').select('*').order('id'),
        supabase.from('humor_flavor_step_types').select('*').order('id'),
      ])
      if (m.data) setModels(m.data as LLMModel[])
      if (it.data) setInputTypes(it.data as LLMInputType[])
      if (ot.data) setOutputTypes(ot.data as LLMOutputType[])
      if (st.data) setStepTypes(st.data as HumorFlavorStepType[])
      setLoadingLookups(false)
    }
    loadLookups()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadFlavors = useCallback(async () => {
    setLoadingFlavors(true)
    const { data } = await supabase
      .from('humor_flavors')
      .select('*')
      .order('created_datetime_utc', { ascending: false })
    if (data) setFlavors(data as HumorFlavor[])
    setLoadingFlavors(false)
  }, [supabase])

  useEffect(() => { loadFlavors() }, [loadFlavors])

  const loadSteps = useCallback(async (flavorId: number) => {
    setLoadingSteps(true)
    const { data } = await supabase
      .from('humor_flavor_steps')
      .select('*')
      .eq('humor_flavor_id', flavorId)
      .order('order_by', { ascending: true })
    if (data) setSteps(data as HumorFlavorStep[])
    setLoadingSteps(false)
  }, [supabase])

  function handleSelectFlavor(flavor: HumorFlavor) {
    setSelectedFlavor(flavor)
    setRightPanel('steps')
    loadSteps(flavor.id)
  }

  function handleFlavorDeleted() {
    setSelectedFlavor(null)
    setSteps([])
    loadFlavors()
  }

  const stepCountByFlavor: Record<number, number> = {}
  // we lazily track steps only for selected flavor; show 0 for others
  flavors.forEach((f) => {
    stepCountByFlavor[f.id] = selectedFlavor?.id === f.id ? steps.length : 0
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Welcome banner */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
            Humor Flavors
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Build prompt chains to generate captions from images.
          </p>
        </div>
        <button
          onClick={() => { setEditingFlavor(null); setFlavorFormOpen(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Flavor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Left column: flavor list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              {flavors.length} flavor{flavors.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loadingFlavors ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : flavors.length === 0 ? (
            <div className="text-center py-12 text-stone-400 dark:text-stone-600">
              <div className="text-3xl mb-2">🌶️</div>
              <p className="text-sm">No flavors yet. Create your first one!</p>
            </div>
          ) : (
            flavors.map((flavor) => (
              <FlavorCard
                key={flavor.id}
                flavor={flavor}
                isSelected={selectedFlavor?.id === flavor.id}
                onSelect={() => handleSelectFlavor(flavor)}
                onEdit={() => { setEditingFlavor(flavor); setFlavorFormOpen(true) }}
                onDeleted={handleFlavorDeleted}
                stepCount={selectedFlavor?.id === flavor.id ? steps.length : 0}
              />
            ))
          )}
        </div>

        {/* Right column: steps + tester */}
        <div>
          {!selectedFlavor ? (
            <div className="card flex flex-col items-center justify-center py-20 text-stone-400 dark:text-stone-600">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-sm font-medium">Select a humor flavor to view its steps</p>
              <p className="text-xs mt-1">or create a new one</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-semibold text-stone-900 dark:text-stone-100 text-base leading-snug">
                      {selectedFlavor.description}
                    </h2>
                    <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500">
                      {selectedFlavor.slug}
                    </span>
                  </div>
                  {/* Tab switcher */}
                  <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg shrink-0">
                    <button
                      onClick={() => setRightPanel('steps')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        rightPanel === 'steps'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                          : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                      }`}
                    >
                      🪜 Steps ({steps.length})
                    </button>
                    <button
                      onClick={() => setRightPanel('test')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        rightPanel === 'test'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                          : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                      }`}
                    >
                      ✨ Test
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {rightPanel === 'steps' ? (
                  loadingSteps || loadingLookups ? (
                    <div className="flex justify-center py-12">
                      <Spinner />
                    </div>
                  ) : (
                    <StepsPanel
                      flavorId={selectedFlavor.id}
                      steps={steps}
                      onStepsChange={() => loadSteps(selectedFlavor.id)}
                      models={models}
                      inputTypes={inputTypes}
                      outputTypes={outputTypes}
                      stepTypes={stepTypes}
                    />
                  )
                ) : (
                  <CaptionTester flavor={selectedFlavor} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flavor form modal */}
      <FlavorForm
        open={flavorFormOpen}
        onClose={() => { setFlavorFormOpen(false); setEditingFlavor(null) }}
        onSaved={() => {
          loadFlavors()
          if (editingFlavor && selectedFlavor?.id === editingFlavor.id) {
            // refresh selected flavor info
            loadFlavors()
          }
        }}
        flavor={editingFlavor}
      />
    </div>
  )
}
