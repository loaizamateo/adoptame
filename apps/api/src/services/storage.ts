import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env'
import crypto from 'crypto'

const s3 = env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY
  ? new S3Client({
      region: 'us-east-005',
      endpoint: env.R2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null

// Sube archivo y devuelve el key (no la URL pública)
export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  folder: string
): Promise<string> {
  if (!s3 || !env.R2_BUCKET_NAME) {
    throw new Error('Storage no configurado. Configura las variables R2_* en Railway')
  }

  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
  const key = `${folder}/${crypto.randomUUID()}.${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  )

  return key
}

// Genera una pre-signed URL válida por 1 hora para un key
export async function getSignedFileUrl(key: string): Promise<string> {
  if (!s3 || !env.R2_BUCKET_NAME) return key

  // Si ya es una URL completa (legacy), devolverla tal cual
  if (key.startsWith('http')) return key

  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  })

  return getSignedUrl(s3, command, { expiresIn: 3600 })
}

// Genera pre-signed URLs para un array de keys
export async function signPhotoUrls(photos: string[]): Promise<string[]> {
  return Promise.all(photos.map(getSignedFileUrl))
}

/**
 * Firma en un único batch todas las keys de múltiples items.
 * Deduplica keys y evita firmar la misma key más de una vez.
 *
 * Ejemplo:
 *   signPhotoUrlsBatch([['a','b'], ['b','c']]) → [['urlA','urlB'], ['urlB','urlC']]
 */
export async function signPhotoUrlsBatch(keysPerItem: string[][]): Promise<string[][]> {
  const uniqueKeys = [...new Set(keysPerItem.flat())]
  if (!uniqueKeys.length) return keysPerItem.map(() => [])

  const signed = await Promise.all(uniqueKeys.map(getSignedFileUrl))
  const urlMap = new Map(uniqueKeys.map((key, i) => [key, signed[i]]))

  return keysPerItem.map((keys) => keys.map((key) => urlMap.get(key) ?? key))
}

export async function deleteFile(key: string): Promise<void> {
  if (!s3 || !env.R2_BUCKET_NAME) return
  // Soporta tanto key como URL completa (legacy)
  const fileKey = key.startsWith('http')
    ? key.replace(`${env.R2_PUBLIC_URL}/`, '')
    : key
  await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: fileKey }))
}
