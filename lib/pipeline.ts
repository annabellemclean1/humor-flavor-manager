// lib/pipeline.ts

const API = 'https://api.almostcrackd.ai'

export interface PipelineStep {
  step_order: number
  prompt: string
}

/**
 * Full 3-step pipeline:
 * 1. Get presigned S3 URL
 * 2. Upload file to S3
 * 3. Register image → get imageId
 * 4. Generate captions using imageId
 */
export async function runFlavor(
  file: File,
  _steps: PipelineStep[], // reserved for future prompt-chain use
  authToken: string
): Promise<string[]> {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  }

  // Step 1: Get presigned upload URL
  const presignRes = await fetch(`${API}/pipeline/generate-presigned-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ contentType: file.type }),
  })
  if (!presignRes.ok) throw new Error('Failed to generate upload URL')
  const { presignedUrl, cdnUrl } = await presignRes.json()

  // Step 2: Upload file directly to S3
  const uploadRes = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!uploadRes.ok) throw new Error('Failed to upload image')

  // Step 3: Register image, get imageId
  const registerRes = await fetch(`${API}/pipeline/upload-image-from-url`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
  })
  if (!registerRes.ok) throw new Error('Failed to register image')
  const { imageId } = await registerRes.json()

  // Step 4: Generate captions
  const captionRes = await fetch(`${API}/pipeline/generate-captions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ imageId }),
  })
  if (!captionRes.ok) throw new Error('Failed to generate captions')
  const data = await captionRes.json()

  const rows = Array.isArray(data) ? data : [data]
  return rows.map((c: any) => c.content ?? c)
}