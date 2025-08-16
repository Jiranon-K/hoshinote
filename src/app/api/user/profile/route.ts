import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import User from '@/models/User'
import Post from '@/models/Post'
import Comment from '@/models/Comment'
import { handleAPIError, APIError, validateRequiredFields, sanitizeInput } from '@/lib/api-helpers'
import { logActivity, generateActivityDescription } from '@/lib/activity-logger'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new APIError('Unauthorized', 401)
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select('-password')
    if (!user) {
      throw new APIError('User not found', 404)
    }

    // Get additional stats
    const [postsCount, commentsCount] = await Promise.all([
      Post.countDocuments({ author: user._id }),
      Comment.countDocuments({ author: user._id })
    ])

    const userWithStats = {
      ...user.toObject(),
      postsCount,
      commentsCount
    }

    return NextResponse.json({ user: userWithStats })
  } catch (error) {
    return handleAPIError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new APIError('Unauthorized', 401)
    }

    const body = await request.json()
    const { name, email, bio, avatar, oldAvatar } = body

    // Validate required fields
    validateRequiredFields(body, ['name', 'email'])

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name, 50),
      email: email.toLowerCase().trim(),
      bio: bio ? sanitizeInput(bio, 500) : undefined,
      avatar: avatar ? sanitizeInput(avatar, 200) : undefined
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedData.email)) {
      throw new APIError('Invalid email format', 400)
    }

    // Validate avatar URL if provided
    if (sanitizedData.avatar) {
      try {
        new URL(sanitizedData.avatar)
      } catch {
        throw new APIError('Invalid avatar URL', 400)
      }
    }

    await dbConnect()

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: sanitizedData.email, 
      _id: { $ne: session.user.id } 
    })
    
    if (existingUser) {
      throw new APIError('Email already in use', 409)
    }

 
    if (oldAvatar && sanitizedData.avatar && oldAvatar !== sanitizedData.avatar && oldAvatar.includes('cloudinary.com')) {
      try {
        const urlParts = oldAvatar.split('/')
        const publicIdWithExt = urlParts[urlParts.length - 1]
        const publicId = publicIdWithExt.split('.')[0]
        

        const folderIndex = urlParts.findIndex(part => part === 'hoshi-note')
        if (folderIndex !== -1) {
          const fullPublicId = urlParts.slice(folderIndex).join('/').split('.')[0]
          await cloudinary.uploader.destroy(fullPublicId)
        }
      } catch (deleteError) {
        console.warn('Failed to delete old avatar:', deleteError)
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          ...(sanitizedData.bio !== undefined && { bio: sanitizedData.bio }),
          ...(sanitizedData.avatar !== undefined && { avatar: sanitizedData.avatar }),
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      throw new APIError('User not found', 404)
    }

    // Get additional stats
    const [postsCount, commentsCount] = await Promise.all([
      Post.countDocuments({ author: updatedUser._id }),
      Comment.countDocuments({ author: updatedUser._id })
    ])

    const userWithStats = {
      ...updatedUser.toObject(),
      postsCount,
      commentsCount
    }

    // Log activity
    await logActivity({
      userId: session.user.id,
      type: 'profile_updated',
      description: generateActivityDescription('profile_updated'),
      metadata: {}
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: userWithStats 
    })
  } catch (error) {
    return handleAPIError(error)
  }
}