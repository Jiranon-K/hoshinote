'use client'

import { useEffect, useState } from 'react'
import { formatSafeDate } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface Activity {
  _id: string
  type: string
  description: string
  createdAt: string
  metadata?: {
    postId?: string
    postTitle?: string
    [key: string]: unknown
  }
}

interface ActivityResponse {
  activities: Activity[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchActivities = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      
      const response = await fetch('/api/activities?limit=5')
      if (response.ok) {
        const data: ActivityResponse = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post_created':
        return '📝'
      case 'post_updated':
        return '✏️'
      case 'post_published':
        return '🚀'
      case 'post_deleted':
        return '🗑️'
      case 'comment_created':
        return '💬'
      case 'comment_deleted':
        return '🚫'
      case 'profile_updated':
        return '👤'
      default:
        return '📋'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post_created':
      case 'post_published':
        return 'bg-green-500'
      case 'post_updated':
      case 'profile_updated':
        return 'bg-blue-500'
      case 'comment_created':
        return 'bg-purple-500'
      case 'post_deleted':
      case 'comment_deleted':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🌟</div>
        <p className="text-sm font-medium text-gray-600">No recent activity</p>
        <p className="text-xs text-gray-500 mt-1">
          Start creating posts to see your activity here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          {activities.length} recent activities
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchActivities(true)}
          disabled={refreshing}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity._id} className="flex items-start space-x-3 group">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.description}
                </p>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                {formatSafeDate(activity.createdAt, 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}