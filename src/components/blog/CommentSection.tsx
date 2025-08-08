'use client'

import { useState, useEffect } from 'react'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

interface Comment {
  _id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  parentComment?: string
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data)
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  const handleCommentAdded = (newComment: Comment) => {
    if (newComment.parentComment) {
      return
    }
    setComments([newComment, ...comments])
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter(comment => comment._id !== commentId))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Comments</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg p-4 border">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Comments ({comments.length})
        </h3>
        
        <div className="space-y-6">
          <CommentForm 
            postId={postId}
            onCommentAdded={handleCommentAdded}
          />
          
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  postId={postId}
                  onCommentAdded={handleCommentAdded}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}