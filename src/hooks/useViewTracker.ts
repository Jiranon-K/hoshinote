'use client'

import { useEffect, useRef } from 'react'
import { logger } from '@/lib/logger'

interface UseViewTrackerOptions {
  postId: string
  threshold?: number
  delay?: number
  enabled?: boolean
}

export function useViewTracker({ 
  postId, 
  threshold = 0.5, 
  delay = 1000,
  enabled = true 
}: UseViewTrackerOptions) {
  const hasTracked = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (!enabled || !postId || hasTracked.current) {
      return
    }

    const trackView = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/views`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          hasTracked.current = true
          logger.info('View tracked successfully for post:', postId, 'New views:', data.views)
        } else {
          logger.warn('Failed to track view for post:', postId, 'Status:', response.status)
        }
      } catch (error) {
        logger.error('Error tracking view:', error)
      }
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      
      logger.debug('Intersection observed:', entry.isIntersecting, 'Ratio:', entry.intersectionRatio, 'Threshold:', threshold)
      
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
        logger.debug('Starting view tracking timer for:', delay, 'ms')
        timeoutRef.current = setTimeout(() => {
          trackView()
        }, delay)
      } else if (timeoutRef.current) {
        logger.debug('Clearing view tracking timer')
        clearTimeout(timeoutRef.current)
      }
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: [threshold],
      rootMargin: '0px'
    })

    const target = document.querySelector('article')
    if (target) {
      logger.debug('Starting view tracking for post:', postId, 'Target found:', !!target)
      observer.observe(target)
    } else {
      logger.warn('Article element not found for view tracking')
    }

    return () => {
      observer.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [postId, threshold, delay, enabled])

  return { hasTracked: hasTracked.current }
}