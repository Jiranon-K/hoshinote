'use client'

import { useEffect, useRef } from 'react'

interface UseSimpleViewTrackerOptions {
  postId: string
  delay?: number
  enabled?: boolean
}

export function useSimpleViewTracker({ 
  postId, 
  delay = 2000,
  enabled = true 
}: UseSimpleViewTrackerOptions) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!enabled || !postId || hasTracked.current) {
      return
    }

    const trackView = async () => {
      try {
        console.log('Tracking view for post:', postId)
        const response = await fetch(`/api/posts/${postId}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          hasTracked.current = true
          console.log('View tracked successfully:', data.views)
        } else {
          console.warn('Failed to track view:', response.status)
        }
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }

    const timer = setTimeout(() => {
      trackView()
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [postId, delay, enabled])

  return { hasTracked: hasTracked.current }
}