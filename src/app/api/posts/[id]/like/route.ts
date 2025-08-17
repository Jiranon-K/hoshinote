import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Post, PostLike } from '@/models'
import { Types } from 'mongoose'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as any)?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }

    await dbConnect()

    const post = await Post.findById(id)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const userId = (session as any).user.id
    const existingLike = await PostLike.findOne({
      user: userId,
      post: id
    })

    let isLiked = false
    let likesCount = 0

    if (existingLike) {
      await PostLike.deleteOne({ _id: existingLike._id })
      await Post.findByIdAndUpdate(id, { $inc: { likes: -1 } })
      isLiked = false
    } else {
      await PostLike.create({
        user: userId,
        post: id
      })
      await Post.findByIdAndUpdate(id, { $inc: { likes: 1 } })
      isLiked = true
    }

    const updatedPost = await Post.findById(id)
    likesCount = updatedPost?.likes || 0

    return NextResponse.json({
      isLiked,
      likesCount,
      message: isLiked ? 'Post liked' : 'Post unliked'
    })

  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      )
    }

    await dbConnect()

    const post = await Post.findById(id)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    let isLiked = false
    if (session && (session as any)?.user) {
      const existingLike = await PostLike.findOne({
        user: (session as any).user.id,
        post: id
      })
      isLiked = !!existingLike
    }

    const likesCount = post.likes || 0
    const likedUsers = await PostLike.find({ post: id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10)

    return NextResponse.json({
      isLiked,
      likesCount,
      likedUsers: likedUsers.map(like => ({
        _id: like.user._id,
        name: like.user.name,
        avatar: like.user.avatar,
        likedAt: like.createdAt
      }))
    })

  } catch (error) {
    console.error('Error fetching like status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}