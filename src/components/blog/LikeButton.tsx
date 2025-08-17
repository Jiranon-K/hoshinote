'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  postId: string
  initialLikes?: number
  initialIsLiked?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  showCount?: boolean
  className?: string
  onLikeChange?: (isLiked: boolean, likesCount: number) => void
}

export default function LikeButton({
  postId,
  initialLikes = 0,
  initialIsLiked = false,
  size = 'md',
  variant = 'ghost',
  showCount = true,
  className,
  onLikeChange
}: LikeButtonProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likesCount, setLikesCount] = useState(initialLikes)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLiked(initialIsLiked)
    setLikesCount(initialLikes)
  }, [initialIsLiked, initialLikes])

  const handleLike = async () => {
    if (!session || !(session as any)?.user) {
      return
    }

    if (isLoading) return

    setIsLoading(true)
    
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

      const data = await response.json()
      setIsLiked(data.isLiked)
      setLikesCount(data.likesCount)
      
      onLikeChange?.(data.isLiked, data.likesCount)
    } catch (error) {
      setIsLiked(!optimisticIsLiked)
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1)
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-9 px-3',
    lg: 'h-10 px-4 text-lg'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleLike}
      disabled={!session?.user || isLoading}
      className={cn(
        sizeClasses[size],
        'transition-all duration-300 hover:scale-105',
        isLiked && 'text-red-500 hover:text-red-600',
        !session?.user && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : (
        <Heart 
          className={cn(
            iconSizes[size],
            'transition-all duration-300',
            isLiked ? 'fill-current text-red-500' : 'text-gray-500'
          )} 
        />
      )}
      {showCount && (
        <span className={cn(
          'ml-1 font-medium transition-all duration-300',
          isLiked && 'text-red-500'
        )}>
          {likesCount}
        </span>
      )}
    </Button>
  )
}