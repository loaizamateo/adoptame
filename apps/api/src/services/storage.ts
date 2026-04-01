import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env'
import crypto from 'crypto'

const s3 = env.R2_ACCOUNT_ID
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null

export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  folder: string
): Promise<string> {
  if (!s3 || !env.R2_BUCKET_NAME) {
    throw new Error('Storage no configurado. Configura las variables R2_* en .env')
  }

  const ext = mimeType.split('/')[1] || 'jpg'
  const key = `${folder}/${crypto.randomUUID()}.${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  )

  return `${env.R2_PUBLIC_URL}/${key}`
}

export async function deleteFile(url: string): Promise<void> {
  if (!s3 || !env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) return
  const key = url.replace(`${env.R2_PUBLIC_URL}/`, '')
  await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }))
}
