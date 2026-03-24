export interface Profile {
  id: string
  email: string
  is_superadmin: boolean
  is_matrix_admin: boolean
}

export interface HumorFlavor {
  id: string
  name: string
  description: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  humor_flavor_steps?: HumorFlavorStep[]
}

export interface HumorFlavorStep {
  id: string
  flavor_id: string
  step_order: number
  prompt: string
  created_at: string
  updated_at: string
}

export interface CaptionResult {
  id: string
  flavor_id: string
  image_url: string
  captions: string[]
  created_at: string
}