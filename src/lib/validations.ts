import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional()
})

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot be more than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(strongPasswordRegex, 'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot be more than 100 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  content: z.string().default('<p></p>'),
  excerpt: z.string().min(1, 'Excerpt is required').max(200, 'Excerpt cannot be more than 200 characters'),
  coverImage: z.string().default(''),
  tags: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(500, 'Comment cannot be more than 500 characters'),
  postId: z.string().min(1, 'Post ID is required'),
  parentCommentId: z.string().optional()
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type PostInput = z.infer<typeof postSchema>
export type CommentInput = z.infer<typeof commentSchema>