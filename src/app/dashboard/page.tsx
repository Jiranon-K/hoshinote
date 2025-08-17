'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentActivity from '@/components/dashboard/RecentActivity'
import ViewsAnalytics from '@/components/dashboard/ViewsAnalytics'
import TrendingPosts from '@/components/dashboard/TrendingPosts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalComments: number
  pendingComments?: number
  totalViews: number
  totalLikes: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg border p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isAdmin = (session as any)?.user?.role === 'admin'

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {(session as any)?.user?.name}!
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your {isAdmin ? 'platform' : 'blog'}.
          </p>
        </div>
        <Link href="/dashboard/posts/new" className="cursor-pointer">
          <Button className="cursor-pointer">Create New Post</Button>
        </Link>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 flex-shrink-0">
          <StatsCard
            title={isAdmin ? "Total Posts" : "My Posts"}
            value={stats.totalPosts}
            description={`${stats.publishedPosts} published, ${stats.draftPosts} drafts`}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          
          <StatsCard
            title="Total Views"
            value={stats.totalViews}
            description="Across all your posts"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          
          <StatsCard
            title="Total Likes"
            value={stats.totalLikes}
            description="Hearts from readers"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          
          <StatsCard
            title={isAdmin ? "All Comments" : "Comments"}
            value={stats.totalComments}
            description={isAdmin && stats.pendingComments ? `${stats.pendingComments} pending` : "On your posts"}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 flex-1 min-h-0">
        <ViewsAnalytics />
        <TrendingPosts />
      </div>

      <div className="grid gap-4 md:grid-cols-2 flex-1 min-h-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <Link href="/dashboard/posts/new" className="block cursor-pointer">
              <Button variant="outline" className="w-full justify-start cursor-pointer">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Post
              </Button>
            </Link>
            
            <Link href="/dashboard/posts" className="block cursor-pointer">
              <Button variant="outline" className="w-full justify-start cursor-pointer">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Manage Posts
              </Button>
            </Link>
            
            <Link href="/dashboard/profile" className="block cursor-pointer">
              <Button variant="outline" className="w-full justify-start cursor-pointer">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest blog activity
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <RecentActivity />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}