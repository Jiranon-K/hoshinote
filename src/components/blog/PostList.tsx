'use client'

import { useState, useEffect, useMemo } from 'react'
import PostCard from './PostCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

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
  const [allPosts, setAllPosts] = useState<Post[]>(initialPosts)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isRealTimeSearch, setIsRealTimeSearch] = useState(true)

  const fetchAllPosts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/posts?limit=100')
      const data = await response.json()
      setAllPosts(data.posts)
      if (!search) {
        setPosts(data.posts.slice(0, 12))
        setPagination({
          page: 1,
          limit: 12,
          total: data.posts.length,
          pages: Math.ceil(data.posts.length / 12)
        })
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async (page: number = 1, searchQuery: string = '') => {
    if (isRealTimeSearch && searchQuery) {
      return
    }
    
    setLoading(true)
    setIsRealTimeSearch(false)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/posts?${params}`)
      const data = await response.json()
      
      setPosts(data.posts)
      setAllPosts(data.posts)
      setPagination(data.pagination)
      setCurrentPage(page)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchAllPosts()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setIsRealTimeSearch(true)
      setPosts(allPosts.slice(0, 12))
      setPagination({
        page: 1,
        limit: 12,
        total: allPosts.length,
        pages: Math.ceil(allPosts.length / 12)
      })
      return
    }

    if (!isRealTimeSearch) {
      return
    }

    const debounceTimer = setTimeout(() => {
      const searchLower = search.toLowerCase().trim()
      const filtered = allPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        post.categories.some(category => category.toLowerCase().includes(searchLower)) ||
        post.author.name.toLowerCase().includes(searchLower)
      )
      
      setPosts(filtered)
      setPagination({
        page: 1,
        limit: filtered.length,
        total: filtered.length,
        pages: 1
      })
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [search, allPosts, isRealTimeSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      setIsRealTimeSearch(false)
      fetchPosts(1, search)
    }
  }

  const handlePageChange = (page: number) => {
    fetchPosts(page, search)
  }

  const handleSearchInput = (value: string) => {
    setSearch(value)
    setIsRealTimeSearch(true)
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
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="flex-1 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <Button type="submit" disabled={loading} variant="outline">
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        
        {search && !isRealTimeSearch && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            Search results from server
          </div>
        )}
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && !(isRealTimeSearch && search) && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {/* First page */}
                {currentPage > 2 && (
                  <>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(1)}
                        className="cursor-pointer"
                      >
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}
                
                {/* Previous page */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer"
                    >
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Current page */}
                <PaginationItem>
                  <PaginationLink
                    isActive
                    className="cursor-default"
                  >
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                
                {/* Next page */}
                {currentPage < pagination.pages && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer"
                    >
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Last page */}
                {currentPage < pagination.pages - 1 && (
                  <>
                    {currentPage < pagination.pages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(pagination.pages)}
                        className="cursor-pointer"
                      >
                        {pagination.pages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < pagination.pages && handlePageChange(currentPage + 1)}
                    className={currentPage === pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
          {isRealTimeSearch && search && posts.length > 12 && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Showing all {posts.length} matching results
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}