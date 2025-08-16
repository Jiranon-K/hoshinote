'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/toaster'
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
  const { push: pushToast } = useToast()
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
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onCommentDeleted(comment._id)
        pushToast({
          title: 'Success',
          description: 'Comment deleted successfully',
          type: 'success'
        })
      } else {
        pushToast({
          title: 'Error',
          description: 'Failed to delete comment',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      pushToast({
        title: 'Error',
        description: 'Failed to delete comment',
        type: 'error'
      })
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
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={comment.author.avatar} 
                alt={comment.author.name} 
              />
              <AvatarFallback className="text-sm font-medium">
                {comment.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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