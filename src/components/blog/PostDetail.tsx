import { Badge } from '@/components/ui/badge'
import CommentSection from './CommentSection'
import { formatSafeDate } from '@/lib/date-utils'

interface PostDetailProps {
  post: {
    _id: string
    title: string
    slug: string
    content: string
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


export default function PostDetail({ post }: PostDetailProps) {
  return (
    <article className="max-w-4xl mx-auto">
      {post.coverImage && (
        <div className="relative h-96 overflow-hidden rounded-lg mb-8">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((category) => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <time
                dateTime={post.publishedAt || post.createdAt}
                className="text-sm text-gray-500"
              >
                {post.publishedAt ? (
                  <>Published {formatSafeDate(post.publishedAt, 'MMMM dd, yyyy')}</>
                ) : (
                  <>Created {formatSafeDate(post.createdAt, 'MMMM dd, yyyy')}</>
                )}
              </time>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.views} views
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post.likes} likes
            </span>
          </div>
        </div>
      </header>

      <div className="prose prose-lg max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="text-gray-800 leading-relaxed"
        />
      </div>

      <footer className="border-t border-gray-200 pt-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>

      </footer>

      <CommentSection postId={post._id} />
    </article>
  )
}