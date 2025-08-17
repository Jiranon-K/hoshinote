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
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import PostsTable from '@/components/dashboard/PostsTable'
import { Plus, Filter, Search } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')
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

  const isAdmin = (session as any)?.user.role === 'admin'

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'All Posts' : 'My Posts'}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your blog posts and track their performance.
          </p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Create New Post
          </Button>
        </Link>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Filters and Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
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
        
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {loading ? (
          <div className="border rounded-lg overflow-hidden bg-white shadow-sm flex-1">
            <div className="bg-gray-50/50 p-4 border-b">
              <div className="grid grid-cols-7 gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="divide-y">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-4">
                  <div className="grid grid-cols-7 gap-4 items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-32" />
                    </div>
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-6" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <PostsTable posts={posts} onPostDeleted={handlePostDeleted} />
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 flex-shrink-0">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  <span className="hidden sm:inline">
                    Showing <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pagination.limit, pagination.total)}
                    </span> of{' '}
                  </span>
                  <span className="font-medium">{pagination.total}</span> posts
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(3, pagination.pages))].map((_, i) => {
                      const page = i + 1
                      const isCurrentPage = page === currentPage
                      
                      return (
                        <Button
                          key={page}
                          variant={isCurrentPage ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    
                    {pagination.pages > 3 && currentPage < pagination.pages - 1 && (
                      <>
                        <span className="px-1 text-gray-400">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handlePageChange(pagination.pages)}
                          disabled={loading}
                        >
                          {pagination.pages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pagination.pages || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}