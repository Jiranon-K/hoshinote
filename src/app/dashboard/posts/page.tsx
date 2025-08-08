'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PostsTable from '@/components/dashboard/PostsTable'

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

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function PostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchPosts = async (page: number = 1, status: string = 'all') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (status !== 'all') {
        params.append('status', status)
      }

      const response = await fetch(`/api/posts/user?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setPagination(data.pagination)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(1, statusFilter)
  }, [statusFilter])

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(post => post._id !== postId))
    if (pagination) {
      setPagination({
        ...pagination,
        total: pagination.total - 1,
        pages: Math.ceil((pagination.total - 1) / pagination.limit)
      })
    }
  }

  const handlePageChange = (page: number) => {
    fetchPosts(page, statusFilter)
  }

  const isAdmin = session?.user.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'All Posts' : 'My Posts'}
          </h1>
          <p className="text-gray-600">
            Manage your blog posts and track their performance.
          </p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button>Create New Post</Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <PostsTable posts={posts} onPostDeleted={handlePostDeleted} />

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {pagination.pages} ({pagination.total} posts)
              </span>
              
              <Button
                variant="outline"
                disabled={currentPage === pagination.pages || loading}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}