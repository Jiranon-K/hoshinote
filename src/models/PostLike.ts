import mongoose, { Schema, Document } from 'mongoose'

export interface IPostLike extends Document {
  user: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PostLikeSchema = new Schema<IPostLike>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required'],
    index: true
  }
}, {
  timestamps: true
})

PostLikeSchema.index({ user: 1, post: 1 }, { unique: true })
PostLikeSchema.index({ post: 1, createdAt: -1 })

export default mongoose.models.PostLike || mongoose.model<IPostLike>('PostLike', PostLikeSchema)