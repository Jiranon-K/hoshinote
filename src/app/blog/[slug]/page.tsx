import { notFound } from 'next/navigation'
import PostDetail from '@/components/blog/PostDetail'
import dbConnect from '@/lib/database'
import { Post } from '@/models'
import { Types } from 'mongoose'
import { Metadata } from 'next'

interface PostWithAuthor {
  _id: Types.ObjectId
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  author: {
    _id: Types.ObjectId
    name: string
    email: string
    avatar?: string
  }
  tags: string[]
  categories: string[]
  status: string
  publishedAt?: Date
  views: number
  likes: number
  createdAt: Date
  updatedAt: Date
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found - Hoshi-Note',
      description: 'The requested blog post was not found.',
    }
  }

  return {
    title: `${post.title} - Hoshi-Note`,
    description: post.excerpt,
    keywords: [...post.tags, ...post.categories, 'blog', 'article'],
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `/blog/${post.slug}`,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      tags: [...post.tags, ...post.categories],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  }
}

async function getPost(slug: string) {
  try {
    await dbConnect()
    
    const post = await Post.findOne({ 
      slug, 
      status: 'published' 
    })
      .populate('author', 'name email avatar')
      .lean()
    
    if (!post) {
      return null
    }

    const typedPost = post as unknown as PostWithAuthor
    const serializedPost = {
      ...typedPost,
      _id: String(typedPost._id),
      publishedAt: typedPost.publishedAt?.toISOString(),
      createdAt: typedPost.createdAt.toISOString(),
      updatedAt: typedPost.updatedAt.toISOString(),
      author: {
        ...typedPost.author,
        _id: String(typedPost.author._id)
      }
    }
    
    
    return serializedPost
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />
    </div>
  )
}