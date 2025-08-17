'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { commentSchema, type CommentInput } from '@/lib/validations'
import { z } from 'zod'
import Link from 'next/link'

const commentFormSchema = commentSchema.omit({ postId: true })
type CommentFormInput = z.infer<typeof commentFormSchema>

interface CommentFormProps {
  postId: string
  parentCommentId?: string
  onCommentAdded: (comment: { _id: string; content: string; author: { name: string; avatar?: string }; createdAt: string; updatedAt: string; post: string; status: string }) => void
  onCancel?: () => void
  placeholder?: string
  buttonText?: string
}

export default function CommentForm({ 
  postId, 
  parentCommentId, 
  onCommentAdded, 
  onCancel,
  placeholder = "Write your comment...",
  buttonText = "Post Comment"
}: CommentFormProps) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CommentFormInput>({
    resolver: zodResolver(commentFormSchema)
  })

  const onSubmit = async (data: CommentFormInput) => {
    setIsLoading(true)
    setError('')

    try {
      const payload: CommentInput = {
        ...data,
        postId,
        parentCommentId
      }

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const comment = await response.json()
        onCommentAdded(comment)
        reset()
        if (onCancel) onCancel()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to post comment')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors duration-300">
        <p className="text-gray-600 mb-4">
          You need to be logged in to comment.
        </p>
        <div className="space-x-4">
          <Link href="/auth/login">
            <Button size="sm" className="hover:scale-105 transition-transform duration-200">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">Sign Up</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Avatar className="w-8 h-8 hover:scale-110 transition-transform duration-200 cursor-pointer">
          <AvatarImage 
            src={(session as any).user.avatar || ''} 
            alt={(session as any).user.name || 'User'} 
          />
          <AvatarFallback className="text-sm font-medium bg-gray-300 text-gray-600">
            {(session as any).user.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-gray-900 hover:text-primary transition-colors duration-200 cursor-pointer">
          {(session as any).user.name}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="content" className="sr-only">
            Comment
          </Label>
          <textarea
            id="content"
            rows={3}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none hover:border-primary/50 transition-colors duration-200 cursor-text"
            {...register('content')}
          />
          {errors.content && (
            <p className="text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Posting...' : buttonText}
          </Button>
        </div>
      </form>
    </div>
  )
}