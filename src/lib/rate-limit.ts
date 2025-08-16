const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitOptions {
  maxAttempts?: number
  windowMs?: number
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; remaining: number; resetTime: number } {
  const { maxAttempts = 5, windowMs = 15 * 60 * 1000 } = options // 5 attempts per 15 minutes
  const now = Date.now()
  
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return { success: true, remaining: maxAttempts - 1, resetTime }
  }
  
  if (record.count >= maxAttempts) {
    return { success: false, remaining: 0, resetTime: record.resetTime }
  }
  
  record.count++
  rateLimitMap.set(identifier, record)
  
  return { success: true, remaining: maxAttempts - record.count, resetTime: record.resetTime }
}

export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier)
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, 60 * 1000) // Clean up every minute