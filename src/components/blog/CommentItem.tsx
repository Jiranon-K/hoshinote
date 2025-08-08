'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import CommentForm from './CommentForm'

interface Comment {
  _id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  postId: string
  onCommentAdded: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
  level?: number
}

export default function CommentItem({ 
  comment, 
  postId, 
  onCommentAdded, 
  onCommentDeleted,
  level = 0 
}: CommentItemProps) {
  const { data: session } = useSession()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [replies, setReplies] = useState(comment.replies || [])

  const canDeleteComment = session?.user.role === 'admin' || 
    comment.author.name === session?.user.name

  const handleReply = (newComment: Comment) => {
    setReplies([...replies, newComment])
    setShowReplyForm(false)
    onCommentAdded(newComment)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onCommentDeleted(comment._id)
      } else {
        alert('Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReplyDeleted = (replyId: string) => {
    setReplies(replies.filter(reply => reply._id !== replyId))
  }

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {comment.author.avatar ? (
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {comment.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900">
                  {comment.author.name}
                </span>
                <time
                  dateTime={comment.createdAt}
                  className="text-sm text-gray-500"
                >
                  {format(new Date(comment.createdAt), 'MMM dd, yyyy')}
                </time>
              </div>
              
              <p className="text-gray-800 whitespace-pre-wrap">
                {comment.content}
              </p>
              
              <div className="flex items-center space-x-4 mt-3">
                {session && level < 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                  >
                    Reply
                  </Button>
                )}
                
                {canDeleteComment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {showReplyForm && (
          <div className="mt-4 ml-11">
            <CommentForm
              postId={postId}
              parentCommentId={comment._id}
              onCommentAdded={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write a reply..."
              buttonText="Post Reply"
            />
          </div>
        )}
      </div>
      
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
              onCommentDeleted={handleReplyDeleted}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}