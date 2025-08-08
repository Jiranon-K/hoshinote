import mongoose, { Schema, Document } from 'mongoose'

export interface IPost extends Document {
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  author: mongoose.Types.ObjectId
  tags: string[]
  categories: string[]
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  views: number
  likes: number
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [200, 'Excerpt cannot be more than 200 characters']
  },
  coverImage: {
    type: String,
    default: ''
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  categories: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

PostSchema.pre<IPost>('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

PostSchema.index({ author: 1 })
PostSchema.index({ status: 1 })
PostSchema.index({ publishedAt: -1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ categories: 1 })

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)