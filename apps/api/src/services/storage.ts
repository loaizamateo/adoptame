import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
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

  return `${env.R2_PUBLIC_URL}/${key}`
}

export async function deleteFile(url: string): Promise<void> {
  if (!s3 || !env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) return
  const key = url.replace(`${env.R2_PUBLIC_URL}/`, '')
  await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }))
}
