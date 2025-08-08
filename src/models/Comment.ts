import mongoose, { Schema, Document } from 'mongoose'

export interface IComment extends Document {
  post: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  content: string
  parentComment?: mongoose.Types.ObjectId
  status: 'pending' | 'approved' | 'spam'
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'spam'],
    default: 'pending'
  }
}, {
  timestamps: true
})

CommentSchema.index({ post: 1 })
CommentSchema.index({ author: 1 })
CommentSchema.index({ status: 1 })
CommentSchema.index({ parentComment: 1 })
CommentSchema.index({ createdAt: -1 })

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)