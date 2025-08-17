import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Post, PostLike } from '@/models'

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    await dbConnect()
    
    const { slug } = await params
    
    const post = await Post.findOne({ slug, status: 'published' })
      .populate('author', 'name email avatar')
      .lean()
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    await Post.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } }
    )
    
    let isLiked = false
    if (session && (session as any)?.user) {
      const existingLike = await PostLike.findOne({
        user: (session as any).user.id,
        post: String((post as any)._id)
      })
      isLiked = !!existingLike
    }
    
    return NextResponse.json({
      ...post,
      isLiked
    })
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}