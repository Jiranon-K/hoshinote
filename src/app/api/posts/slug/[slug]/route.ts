import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database'
import { Post } from '@/models'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await dbConnect()
    
    const { slug } = params
    
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
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}