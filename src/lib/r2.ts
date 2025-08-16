import { logger } from '@/lib/logger'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME!

export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    const key = `uploads/${Date.now()}-${filename}`
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
    
    await r2Client.send(command)
    
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`
    
    logger.info('File uploaded to R2', { filename, key, publicUrl })
    
    return publicUrl
  } catch (error) {
    logger.error('R2 upload failed', error)
    throw new Error('Upload failed')
  }
}

export async function deleteFromR2(url: string): Promise<void> {
  try {
    if (url.includes(process.env.R2_PUBLIC_URL!)) {
      const key = url.split(`${process.env.R2_PUBLIC_URL}/`)[1]
      
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
      
      await r2Client.send(command)
      logger.info('File deleted from R2', { url, key })
    }
  } catch (error) {
    logger.error('R2 delete failed', error)
    throw new Error('Delete failed')
  }
}