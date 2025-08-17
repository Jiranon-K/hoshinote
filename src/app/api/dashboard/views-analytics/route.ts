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
    
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const matchCondition = isAdmin ? {} : { author: userObjectId }

    const [
      totalViewsResult,
      recentViewsResult,
      previousWeekViewsResult,
      topPosts
    ] = await Promise.all([
      Post.aggregate([
        { $match: matchCondition },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      
      Post.aggregate([
        { 
          $match: { 
            ...matchCondition,
            updatedAt: { $gte: sevenDaysAgo }
          } 
        },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      
      Post.aggregate([
        { 
          $match: { 
            ...matchCondition,
            updatedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
          } 
        },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      
      Post.find({
        ...matchCondition,
        status: 'published',
        views: { $gt: 0 }
      })
        .select('title slug views publishedAt status')
        .sort({ views: -1 })
        .limit(10)
        .lean()
    ])

    const totalViews = totalViewsResult[0]?.total || 0
    const recentViews = recentViewsResult[0]?.total || 0
    const previousWeekViews = previousWeekViewsResult[0]?.total || 0

    let viewsTrend = null
    if (previousWeekViews > 0) {
      const trendValue = ((recentViews - previousWeekViews) / previousWeekViews) * 100
      viewsTrend = {
        value: Math.round(Math.abs(trendValue)),
        isPositive: trendValue >= 0
      }
    } else if (recentViews > 0) {
      viewsTrend = {
        value: 100,
        isPositive: true
      }
    }

    const serializedTopPosts = topPosts.map(post => ({
      ...post,
      _id: String(post._id),
      publishedAt: post.publishedAt?.toISOString()
    }))

    return NextResponse.json({
      totalViews,
      recentViews,
      topPosts: serializedTopPosts,
      viewsTrend
    })

  } catch (error) {
    console.error('Error fetching views analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch views analytics' },
      { status: 500 }
    )
  }
}