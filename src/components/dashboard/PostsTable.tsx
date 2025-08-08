'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

interface Post {
  _id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  author: {
    name: string
    email: string
  }
  views: number
  likes: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

interface PostsTableProps {
  posts: Post[]
  onPostDeleted: (postId: string) => void
}

export default function PostsTable({ posts, onPostDeleted }: PostsTableProps) {
  const { data: session } = useSession()
  const [deletingPost, setDeletingPost] = useState<string | null>(null)

  const handleDelete = async (postId: string) => {
    setDeletingPost(postId)
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onPostDeleted(postId)
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    } finally {
      setDeletingPost(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const canEditPost = (post: Post) => {
    return session?.user.role === 'admin' || post.author.email === session?.user.email
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No posts found
        </h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first blog post.
        </p>
        <Link href="/dashboard/posts/new">
          <Button>Create New Post</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post._id}>
              <TableCell>
                <div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-medium hover:underline"
                    target="_blank"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-gray-500">/{post.slug}</p>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(post.status)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-gray-500">{post.author.email}</p>
                </div>
              </TableCell>
              <TableCell>{post.views}</TableCell>
              <TableCell>{post.likes}</TableCell>
              <TableCell>
                <div>
                  {post.publishedAt ? (
                    <>
                      <p className="text-sm">
                        Published {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Created {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  {canEditPost(post) && (
                    <>
                      <Link href={`/dashboard/posts/edit/${post._id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={deletingPost === post._id}
                          >
                            {deletingPost === post._id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(post._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}