import { NextResponse } from 'next/server'

export class APIError extends Error {
  statusCode: number
  
  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof Error) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      )
    }
    
    // MongoDB duplicate key error
    if ('code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      )
    }
    
    // Database connection errors
    if (error.message.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
  }
  
  // Generic server error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export function validateRequiredFields(data: Record<string, any>, fields: string[]) {
  const missing = fields.filter(field => !data[field] || data[field].trim() === '')
  
  if (missing.length > 0) {
    throw new APIError(`Missing required fields: ${missing.join(', ')}`, 400)
  }
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Basic XSS protection
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}