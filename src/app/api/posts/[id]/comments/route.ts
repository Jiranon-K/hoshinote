import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Comment, Post } from '@/models'
import { commentSchema } from '@/lib/validations'
import { Types } from 'mongoose'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    await dbConnect()
    
    const { id } = params
    
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
    
    const comments = await Comment.find({ 
      post: id, 
      status: 'approved' 
    })
      .populate('author', 'name avatar')
      .populate('parentComment')
      .sort({ createdAt: -1 })
      .lean()
    
    const commentsWithReplies = await Promise.all(
      comments
        .filter(comment => !comment.parentComment)
        .map(async (comment) => {
          const replies = await Comment.find({
            parentComment: comment._id,
            status: 'approved'
          })
            .populate('author', 'name avatar')
            .sort({ createdAt: 1 })
            .lean()
          
          return {
            ...comment,
            replies
          }
        })
    )
    
    return NextResponse.json(commentsWithReplies)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    
    const { id } = params
    
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
    
    const body = await request.json()
    const validatedData = commentSchema.parse({
      ...body,
      postId: id
    })
    
    if (validatedData.parentCommentId && !Types.ObjectId.isValid(validatedData.parentCommentId)) {
      return NextResponse.json(
        { error: 'Invalid parent comment ID' },
        { status: 400 }
      )
    }
    
    if (validatedData.parentCommentId) {
      const parentComment = await Comment.findById(validatedData.parentCommentId)
      if (!parentComment || parentComment.post.toString() !== id) {
        return NextResponse.json(
          { error: 'Invalid parent comment' },
          { status: 400 }
        )
      }
    }
    
    const comment = await Comment.create({
      post: id,
      author: session.user.id,
      content: validatedData.content,
      parentComment: validatedData.parentCommentId || null,
      status: 'approved'
    })
    
    await comment.populate('author', 'name avatar')
    
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}