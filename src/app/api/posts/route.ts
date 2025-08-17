import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Post, PostLike } from '@/models'
import { postSchema } from '@/lib/validations'
import { logActivity, generateActivityDescription } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'published'
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit
    
    const filter: Record<string, unknown> = { status }
    
    if (category) {
      filter.categories = { $in: [category] }
    }
    
    if (tag) {
      filter.tags = { $in: [tag] }
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ]
    }
    
    const posts = await Post.find(filter)
      .populate('author', 'name email avatar')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Post.countDocuments(filter)
    
    let postsWithLikeStatus = posts
    
    if (session && (session as any)?.user) {
      const postIds = posts.map(post => post._id)
      const userLikes = await PostLike.find({
        user: (session as any).user.id,
        post: { $in: postIds }
      }).lean()
      
      const likedPostIds = new Set(userLikes.map(like => like.post.toString()))
      
      postsWithLikeStatus = posts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(String(post._id))
      }))
    } else {
      postsWithLikeStatus = posts.map(post => ({
        ...post,
        isLiked: false
      }))
    }
    
    return NextResponse.json({
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as any)?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const body = await request.json()
    const validatedData = postSchema.parse(body)
    
    const existingPost = await Post.findOne({ slug: validatedData.slug })
    if (existingPost) {
      return NextResponse.json(
        { error: 'Post with this slug already exists' },
        { status: 409 }
      )
    }
    
    const post = await Post.create({
      ...validatedData,
      author: (session as any).user.id
    })
    
    await post.populate('author', 'name email avatar')
    
    // Log activity
    await logActivity({
      userId: (session as any).user.id,
      type: 'post_created',
      description: generateActivityDescription('post_created', {
        postTitle: post.title,
        postId: post._id.toString()
      }),
      metadata: {
        postId: post._id.toString(),
        postTitle: post.title
      }
    })
    
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}