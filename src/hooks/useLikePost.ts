'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface LikeData {
  isLiked: boolean
  likesCount: number
  likedUsers?: Array<{
    _id: string
    name: string
    avatar?: string
    likedAt: string
  }>
}

interface UseLikePostReturn {
  isLiked: boolean
  likesCount: number
  likedUsers: Array<{
    _id: string
    name: string
    avatar?: string
    likedAt: string
  }>
  isLoading: boolean
  error: string | null
  toggleLike: () => Promise<void>
  fetchLikeData: () => Promise<void>
}

export function useLikePost(postId: string, initialData?: Partial<LikeData>): UseLikePostReturn {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(initialData?.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(initialData?.likesCount ?? 0)
  const [likedUsers, setLikedUsers] = useState(initialData?.likedUsers ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLikeData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/posts/${postId}/like`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch like data')
      }

      const data: LikeData = await response.json()
      setIsLiked(data.isLiked)
      setLikesCount(data.likesCount)
      setLikedUsers(data.likedUsers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching like data:', err)
    }
  }, [postId])

  const toggleLike = async () => {
    if (!session || !(session as any)?.user) {
      setError('Authentication required')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    setError(null)
    
    const optimisticIsLiked = !isLiked
    const optimisticCount = isLiked ? likesCount - 1 : likesCount + 1
    
    setIsLiked(optimisticIsLiked)
    setLikesCount(optimisticCount)

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const data: LikeData = await response.json()
      setIsLiked(data.isLiked)
      setLikesCount(data.likesCount)
      
      await fetchLikeData()
    } catch (err) {
      setIsLiked(!optimisticIsLiked)
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1)
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error toggling like:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session !== undefined && postId) {
      fetchLikeData()
    }
  }, [postId, session, fetchLikeData])

  return {
    isLiked,
    likesCount,
    likedUsers,
    isLoading,
    error,
    toggleLike,
    fetchLikeData
  }
}