import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Post } from '@/models'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    
    const { id: postId } = await params
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const post = await Post.findById(postId)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.status !== 'published') {
      return NextResponse.json(
        { error: 'Post not published' },
        { status: 403 }
      )
    }

    const sessionKey = `view_${postId}_${clientIP}`
    
    try {
      const sessionCookie = request.cookies.get(sessionKey)
      
      if (sessionCookie) {
        const lastViewed = new Date(sessionCookie.value)
        const now = new Date()
        const timeDiff = now.getTime() - lastViewed.getTime()
        const hoursDiff = timeDiff / (1000 * 60 * 60)
        
        if (hoursDiff < 1) {
          return NextResponse.json({
            success: true,
            views: post.views,
            message: 'View already counted'
          })
        }
      }
    } catch (error) {
      logger.debug('Session check failed, proceeding with view increment', error)
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { views: 1 } },
      { new: true }
    )

    const response = NextResponse.json({
      success: true,
      views: updatedPost.views
    })

    response.cookies.set(sessionKey, new Date().toISOString(), {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    logger.info('Post view incremented', { 
      postId, 
      newViews: updatedPost.views,
      clientIP: clientIP.substring(0, 10) + '...'
    })

    return response

  } catch (error) {
    logger.error('Error incrementing post views:', error)
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    )
  }
}