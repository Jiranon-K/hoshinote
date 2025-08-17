'use client'

import { useState } from 'react'
import PostCard from './PostCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Post {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  author: {
    name: string
    avatar?: string
  }
  tags: string[]
  categories: string[]
  publishedAt?: string
  createdAt: string
  views: number
  likes: number
}

interface PostListProps {
  initialPosts?: Post[]
  initialPagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function PostList({ initialPosts = [], initialPagination }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchPosts = async (page: number = 1, searchQuery: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9'
      })
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/posts?${params}`)
      const data = await response.json()
      
      setPosts(data.posts)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts(1, search)
  }

  const handlePageChange = (page: number) => {
    fetchPosts(page, search)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="flex gap-4">
        <Input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No posts found
          </h3>
          <p className="text-gray-600">
            {search ? 'Try adjusting your search terms.' : 'Be the first to write a post!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

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
                Page {currentPage} of {pagination.pages}
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