export interface Profile {
  id: string
  created_datetime_utc: string
  modified_datetime_utc: string
  first_name: string | null
  last_name: string | null
  email: string | null
  is_superadmin: boolean
  is_in_study: boolean
  is_matrix_admin: boolean
}

export interface HumorFlavor {
  id: number
  created_datetime_utc: string
  description: string
  slug: string
  humor_flavor_steps?: HumorFlavorStep[]
}

export interface HumorFlavorStep {
  id: number
  created_datetime_utc: string
  humor_flavor_id: number
  llm_temperature: number
  order_by: number
  llm_input_type_id: number
  llm_output_type_id: number
  llm_model_id: number
  humor_flavor_step_type_id: number
  llm_system_prompt: string
  llm_user_prompt: string
  description: string | null
  // joined
  llm_models?: LLMModel
  llm_input_types?: LLMInputType
  llm_output_types?: LLMOutputType
  humor_flavor_step_types?: HumorFlavorStepType
}

export interface LLMModel {
  id: number
  name: string
  llm_provider_id: number
  provider_model_id: string
  is_temperature_supported: boolean
}

export interface LLMInputType {
  id: number
  description: string
  slug: string
}

export interface LLMOutputType {
  id: number
  description: string
  slug: string
}

export interface HumorFlavorStepType {
  id: number
  slug: string
  description: string
}

export interface Caption {
  id: string | number
  caption_text?: string
  text?: string
  [key: string]: unknown
}

export interface TestResult {
  imageUrl: string
  imageId: string
  captions: Caption[]
  error?: string
}
