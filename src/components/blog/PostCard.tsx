'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { formatSafeDate } from '@/lib/date-utils'

interface PostCardProps {
  post: {
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
}


export default function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [avatarError, setAvatarError] = useState(false)

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] group cursor-pointer border hover:border-primary/20">
      {post.coverImage && !imageError && (
        <Link href={`/blog/${post.slug}`} className="cursor-pointer">
          <div className="relative h-48 overflow-hidden bg-gray-100">
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}
      {(!post.coverImage || imageError) && (
        <Link href={`/blog/${post.slug}`} className="cursor-pointer">
          <div className="relative h-48 overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-500">
            <div className="text-center text-gray-500 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50 group-hover:opacity-70 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">{post.title}</span>
            </div>
          </div>
        </Link>
      )}
      <CardHeader>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center space-x-3">
            {post.author.avatar && !avatarError ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span>{post.author.name}</span>
          </div>
          <time dateTime={post.publishedAt || post.createdAt}>
            {formatSafeDate(post.publishedAt || post.createdAt)}
          </time>
        </div>
        <Link href={`/blog/${post.slug}`} className="hover:underline group/title cursor-pointer">
          <h3 className="post-title-thai text-xl font-semibold text-gray-900 line-clamp-2 group-hover/title:text-primary transition-colors duration-300">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="post-excerpt-thai text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors duration-200 cursor-pointer">
                +{post.tags.length - 2}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.views}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post.likes}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}