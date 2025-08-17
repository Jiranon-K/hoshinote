import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Post, Comment } from '@/models'
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
    
    if (isAdmin) {
      const [
        totalPosts,
        publishedPosts,
        draftPosts,
        totalComments,
        pendingComments,
        totalViews,
        totalLikes
      ] = await Promise.all([
        Post.countDocuments(),
        Post.countDocuments({ status: 'published' }),
        Post.countDocuments({ status: 'draft' }),
        Comment.countDocuments(),
        Comment.countDocuments({ status: 'pending' }),
        Post.aggregate([
          { $group: { _id: null, total: { $sum: '$views' } } }
        ]),
        Post.aggregate([
          { $group: { _id: null, total: { $sum: '$likes' } } }
        ])
      ])
      
      return NextResponse.json({
        totalPosts,
        publishedPosts,
        draftPosts,
        totalComments,
        pendingComments,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0
      })
    } else {
      const [
        userPosts,
        publishedPosts,
        draftPosts,
        userComments,
        userViews,
        userLikes
      ] = await Promise.all([
        Post.countDocuments({ author: userObjectId }),
        Post.countDocuments({ author: userObjectId, status: 'published' }),
        Post.countDocuments({ author: userObjectId, status: 'draft' }),
        Comment.countDocuments({ author: userObjectId }),
        Post.aggregate([
          { $match: { author: userObjectId } },
          { $group: { _id: null, total: { $sum: '$views' } } }
        ]),
        Post.aggregate([
          { $match: { author: userObjectId } },
          { $group: { _id: null, total: { $sum: '$likes' } } }
        ])
      ])
      
      return NextResponse.json({
        totalPosts: userPosts,
        publishedPosts,
        draftPosts,
        totalComments: userComments,
        totalViews: userViews[0]?.total || 0,
        totalLikes: userLikes[0]?.total || 0
      })
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}