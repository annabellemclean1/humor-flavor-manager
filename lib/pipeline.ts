const BASE_URL = 'https://api.almostcrackd.ai'

export async function generatePresignedUrl(
  jwt: string,
  contentType: string
): Promise<{ presignedUrl: string; cdnUrl: string }> {
  const res = await fetch(`${BASE_URL}/pipeline/generate-presigned-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ contentType }),
  })
  if (!res.ok) throw new Error(`Failed to generate presigned URL: ${res.statusText}`)
  return res.json()
}

export async function uploadToS3(
  presignedUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) throw new Error(`Failed to upload to S3: ${res.statusText}`)
}

export async function registerImageInPipeline(
  jwt: string,
  imageUrl: string
): Promise<{ imageId: string; now: number }> {
  const res = await fetch(`${BASE_URL}/pipeline/upload-image-from-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ imageUrl, isCommonUse: false }),
  })
  if (!res.ok) throw new Error(`Failed to register image: ${res.statusText}`)
  return res.json()
}

export async function generateCaptions(
  jwt: string,
  imageId: string
): Promise<unknown[]> {
  const res = await fetch(`${BASE_URL}/pipeline/generate-captions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ imageId }),
  })
  if (!res.ok) throw new Error(`Failed to generate captions: ${res.statusText}`)
  return res.json()
}

export async function processImageFull(
  jwt: string,
  file: File
): Promise<{ imageId: string; cdnUrl: string; captions: unknown[] }> {
  // Step 1: presigned URL
  const { presignedUrl, cdnUrl } = await generatePresignedUrl(jwt, file.type)

  // Step 2: upload to S3
  await uploadToS3(presignedUrl, file)

  // Step 3: register in pipeline
  const { imageId } = await registerImageInPipeline(jwt, cdnUrl)

  // Step 4: generate captions
  const captions = await generateCaptions(jwt, imageId)

  return { imageId, cdnUrl, captions }
}

export async function processImageFromUrl(
  jwt: string,
  imageUrl: string
): Promise<{ imageId: string; captions: unknown[] }> {
  // Step 3: register in pipeline
  const { imageId } = await registerImageInPipeline(jwt, imageUrl)

  // Step 4: generate captions
  const captions = await generateCaptions(jwt, imageId)

  return { imageId, captions }
}
