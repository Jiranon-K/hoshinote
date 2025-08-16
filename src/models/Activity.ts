import mongoose, { Schema, Document } from 'mongoose'

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId
  type: 'post_created' | 'post_updated' | 'post_deleted' | 'post_published' | 'comment_created' | 'comment_deleted' | 'profile_updated'
  description: string
  metadata?: {
    postId?: string
    postTitle?: string
    commentId?: string
    oldStatus?: string
    newStatus?: string
    [key: string]: unknown
  }
  createdAt: Date
}

const ActivitySchema = new Schema<IActivity>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['post_created', 'post_updated', 'post_deleted', 'post_published', 'comment_created', 'comment_deleted', 'profile_updated'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
})

ActivitySchema.index({ user: 1, createdAt: -1 })

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema)