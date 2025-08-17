'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatSafeDate } from '@/lib/date-utils'

interface TrendingPost {
  _id: string
  title: string
  slug: string
  views: number
  publishedAt?: string
  status: string
  excerpt: string
  coverImage?: string
}

export default function TrendingPosts() {
  const [posts, setPosts] = useState<TrendingPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const response = await fetch('/api/dashboard/trending-posts')
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts)
        }
      } catch (error) {
        console.error('Error fetching trending posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingPosts()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Trending Posts
          </CardTitle>
          <CardDescription>Your most popular content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trending Posts
        </CardTitle>
        <CardDescription>Your most popular content this week</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p>No trending posts yet</p>
            <p className="text-sm">Posts with views will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, index) => (
              <div key={post._id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <Badge 
                    variant={index < 3 ? "default" : "secondary"} 
                    className="w-8 h-8 rounded-full flex items-center justify-center p-0"
                  >
                    {index + 1}
                  </Badge>
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="block hover:text-blue-600 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 mb-1 truncate">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {post.excerpt}
                    </p>
                  </Link>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {post.publishedAt && formatSafeDate(post.publishedAt, 'MMM dd')}
                    </span>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="font-medium">{post.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}