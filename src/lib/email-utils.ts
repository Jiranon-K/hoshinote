import { logger } from '@/lib/logger'


export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function sendVerificationEmail(email: string, token: string) {

  
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`
  
  logger.info(`Send verification email to ${email}`)
  logger.info(`Verification URL: ${verificationUrl}`)

  
  return true
}