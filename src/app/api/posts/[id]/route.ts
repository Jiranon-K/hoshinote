import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Post } from '@/models'
import { postSchema } from '@/lib/validations'
import { Types } from 'mongoose'
import { logActivity, generateActivityDescription } from '@/lib/activity-logger'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await dbConnect()
    
    const { id } = await params
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }
    
    const post = await Post.findById(id)
      .populate('author', 'name email avatar')
      .lean()
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    await Post.findByIdAndUpdate(id, { $inc: { views: 1 } })
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const { id } = await params
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }
    
    const post = await Post.findById(id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    if (post.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to update this post' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = postSchema.parse(body)
    
    if (validatedData.slug !== post.slug) {
      const existingPost = await Post.findOne({ 
        slug: validatedData.slug, 
        _id: { $ne: id } 
      })
      
      if (existingPost) {
        return NextResponse.json(
          { error: 'Post with this slug already exists' },
          { status: 409 }
        )
      }
    }
    
    const oldStatus = post.status
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      validatedData,
      { new: true }
    ).populate('author', 'name email avatar')
    
    // Log activity
    const isStatusChange = oldStatus !== validatedData.status
    const activityType = isStatusChange && validatedData.status === 'published' ? 'post_published' : 'post_updated'
    
    await logActivity({
      userId: session.user.id,
      type: activityType,
      description: generateActivityDescription(activityType, {
        postTitle: updatedPost.title,
        postId: updatedPost._id.toString(),
        oldStatus,
        newStatus: validatedData.status
      }),
      metadata: {
        postId: updatedPost._id.toString(),
        postTitle: updatedPost.title,
        oldStatus,
        newStatus: validatedData.status
      }
    })
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    await dbConnect()
    
    const { id } = await params
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }
    
    const post = await Post.findById(id)
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    if (post.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to delete this post' },
        { status: 403 }
      )
    }
    
    // Log activity before deletion
    await logActivity({
      userId: session.user.id,
      type: 'post_deleted',
      description: generateActivityDescription('post_deleted', {
        postTitle: post.title,
        postId: post._id.toString()
      }),
      metadata: {
        postId: post._id.toString(),
        postTitle: post.title
      }
    })
    
    await Post.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}