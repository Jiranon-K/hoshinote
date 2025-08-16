import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Activity } from '@/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const page = parseInt(url.searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const activities = await Activity
      .find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 50))
      .skip(skip)
      .lean()

    const total = await Activity.countDocuments({ user: session.user.id })

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}