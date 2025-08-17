import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Post } from '@/models'
import { Types } from 'mongoose'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as any)?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const userId = (session as any).user.id
    const userObjectId = new Types.ObjectId(userId)
    const isAdmin = (session as any).user.role === 'admin'
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const matchCondition = {
      ...(isAdmin ? {} : { author: userObjectId }),
      status: 'published',
      views: { $gt: 0 },
      publishedAt: { $gte: sevenDaysAgo }
    }

    const trendingPosts = await Post.find(matchCondition)
      .select('title slug excerpt coverImage views publishedAt status')
      .sort({ views: -1 })
      .limit(5)
      .lean()

    const serializedPosts = trendingPosts.map(post => ({
      ...post,
      _id: String(post._id),
      publishedAt: post.publishedAt?.toISOString()
    }))

    return NextResponse.json({
      posts: serializedPosts
    })

  } catch (error) {
    console.error('Error fetching trending posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending posts' },
      { status: 500 }
    )
  }
}