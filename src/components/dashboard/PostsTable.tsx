'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { formatSafeDate } from '@/lib/date-utils'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  MoreHorizontal, 
  Eye, 
  Heart, 
  Calendar,
  Edit2,
  Trash2,
  ExternalLink,
  Copy
} from 'lucide-react'

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You might want to add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

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
        <Link href="/dashboard/posts/new" className="cursor-pointer">
          <Button className="cursor-pointer">Create New Post</Button>
        </Link>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Author</TableHead>
              <TableHead className="font-semibold text-center">
                <div className="flex items-center justify-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>Views</span>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-center">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>Likes</span>
                </div>
              </TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow 
                key={post._id} 
                className="group hover:bg-gray-50/50 transition-colors duration-200"
              >
                <TableCell className="py-4">
                  <div className="max-w-md">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
                      target="_blank"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">/{post.slug}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 hover:bg-primary/10"
                            onClick={() => copyToClipboard(`${window.location.origin}/blog/${post.slug}`)}
                          >
                            <Copy className="w-3 h-3 transition-transform duration-200 hover:rotate-12" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy link</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  {getStatusBadge(post.status)}
                </TableCell>
                <TableCell className="py-4">
                  <div>
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    <p className="text-sm text-gray-500">{post.author.email}</p>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-medium">{post.views}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-medium text-red-500">{post.likes}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div>
                    {post.publishedAt ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Published</p>
                          <p className="text-xs text-gray-500">
                            {formatSafeDate(post.publishedAt)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Created</p>
                          <p className="text-xs text-gray-500">
                            {formatSafeDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-right">
                  {canEditPost(post) ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 hover:scale-110 hover:bg-primary/10"
                        >
                          <MoreHorizontal className="h-4 w-4 transition-transform duration-200 hover:rotate-90" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank" className="flex items-center gap-2 transition-all duration-200 hover:scale-105 group/item">
                            <ExternalLink className="w-4 h-4 transition-transform duration-200 group-hover/item:rotate-12" />
                            View post
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => copyToClipboard(`${window.location.origin}/blog/${post.slug}`)}
                          className="flex items-center gap-2 transition-all duration-200 hover:scale-105 group/item"
                        >
                          <Copy className="w-4 h-4 transition-transform duration-200 group-hover/item:rotate-12" />
                          Copy link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/posts/edit/${post._id}`} className="flex items-center gap-2 transition-all duration-200 hover:scale-105 group/item">
                            <Edit2 className="w-4 h-4 transition-transform duration-200 group-hover/item:rotate-12" />
                            Edit post
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="flex items-center gap-2 text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete post
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Post</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;<strong>{post.title}</strong>&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(post._id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingPost === post._id}
                              >
                                {deletingPost === post._id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>No permissions</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </TooltipProvider>
  )
}