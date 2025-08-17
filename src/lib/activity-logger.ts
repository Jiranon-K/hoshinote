import { Activity } from '@/models'
import dbConnect from './database'

export interface ActivityLogData {
  userId: string
  type: 'post_created' | 'post_updated' | 'post_deleted' | 'post_published' | 'comment_created' | 'comment_deleted' | 'profile_updated' | 'role_upgraded'
  description: string
  metadata?: {
    postId?: string
    postTitle?: string
    commentId?: string
    oldStatus?: string
    newStatus?: string
    oldRole?: string
    newRole?: string
    trigger?: string
    [key: string]: unknown
  }
}

export async function logActivity(data: ActivityLogData) {
  try {
    await dbConnect()
    
    const activity = new Activity({
      user: data.userId,
      type: data.type,
      description: data.description,
      metadata: data.metadata || {}
    })

    await activity.save()
    return activity
  } catch (error) {
    console.error('Error logging activity:', error)
    return null
  }
}

export function generateActivityDescription(type: string, metadata: Record<string, unknown> = {}): string {
  switch (type) {
    case 'post_created':
      return `Created new post "${metadata.postTitle}"`
    case 'post_updated':
      return `Updated post "${metadata.postTitle}"`
    case 'post_deleted':
      return `Deleted post "${metadata.postTitle}"`
    case 'post_published':
      return `Published post "${metadata.postTitle}"`
    case 'comment_created':
      return `Added a comment on "${metadata.postTitle}"`
    case 'comment_deleted':
      return `Deleted a comment on "${metadata.postTitle}"`
    case 'profile_updated':
      return `Updated profile information`
    case 'role_upgraded':
      return `Role upgraded from ${metadata.oldRole} to ${metadata.newRole}`
    default:
      return `Performed an action`
  }
}