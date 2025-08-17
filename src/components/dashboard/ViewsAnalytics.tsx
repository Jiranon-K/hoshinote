'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatSafeDate } from '@/lib/date-utils'

interface TopPost {
  _id: string
  title: string
  slug: string
  views: number
  publishedAt?: string
  status: string
}

interface ViewsData {
  totalViews: number
  recentViews: number
  topPosts: TopPost[]
  viewsTrend: {
    value: number
    isPositive: boolean
  }
}

export default function ViewsAnalytics() {
  const [data, setData] = useState<ViewsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchViewsData = async () => {
      try {
        const response = await fetch('/api/dashboard/views-analytics')
        if (response.ok) {
          const viewsData = await response.json()
          setData(viewsData)
        }
      } catch (error) {
        console.error('Error fetching views analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchViewsData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Views Analytics
          </CardTitle>
          <CardDescription>Detailed insights into your post views</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Views Analytics
          </CardTitle>
          <CardDescription>Detailed insights into your post views</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Views Analytics
        </CardTitle>
        <CardDescription>Detailed insights into your post views</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {data.totalViews.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Total Views</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {data.recentViews.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Last 7 Days</div>
            {data.viewsTrend && (
              <div className={`flex items-center justify-center text-xs mt-1 ${
                data.viewsTrend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <svg 
                  className={`w-3 h-3 mr-1 ${
                    data.viewsTrend.isPositive ? '' : 'transform rotate-180'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l9-9 9 9" />
                </svg>
                {Math.abs(data.viewsTrend.value)}%
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <h4 className="font-semibold text-gray-900 mb-3">Top Performing Posts</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.topPosts.map((post, index) => (
              <div 
                key={post._id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Badge variant={index < 3 ? "default" : "secondary"} className="w-6 h-6 rounded-full flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate block"
                    >
                      {post.title}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {post.publishedAt && formatSafeDate(post.publishedAt, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-semibold text-gray-900">
                    {post.views.toLocaleString()}
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          {data.topPosts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>No posts with views yet</p>
              <p className="text-sm">Publish some posts to see analytics!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}