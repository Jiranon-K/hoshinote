import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Post, Comment } from '@/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const userId = session.user.id
    const isAdmin = session.user.role === 'admin'
    
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
        Post.countDocuments({ author: userId }),
        Post.countDocuments({ author: userId, status: 'published' }),
        Post.countDocuments({ author: userId, status: 'draft' }),
        Comment.countDocuments({ author: userId }),
        Post.aggregate([
          { $match: { author: userId } },
          { $group: { _id: null, total: { $sum: '$views' } } }
        ]),
        Post.aggregate([
          { $match: { author: userId } },
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