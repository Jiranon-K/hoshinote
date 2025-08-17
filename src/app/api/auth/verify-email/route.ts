import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { User } from '@/models'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOne({ 
    })

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url))
    }


    return NextResponse.redirect(new URL('/auth/login?verified=true', request.url))
  } catch (error) {
    logger.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url))
  }
}

