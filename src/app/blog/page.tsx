import PostList from '@/components/blog/PostList'
import dbConnect from '@/lib/database'
import { Post } from '@/models'

async function getPosts() {
  try {
    await dbConnect()
    
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name email avatar')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(9)
      .lean()
     
    const serializedPosts = posts.map(post => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedPost = post as any
      return {
        ...typedPost,
        _id: String(typedPost._id),
        author: {
          ...typedPost.author,
          _id: String(typedPost.author._id)
        }
      }
    })
    
    return { 
      posts: serializedPosts, 
      pagination: {
        page: 1,
        limit: 9,
        total: serializedPosts.length,
        pages: 1
      }
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], pagination: undefined }
  }
}

export default async function BlogPage() {
  const data = await getPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog Posts
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
        </div>

        {data.posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No posts found
            </h2>
            <p className="text-gray-500">
              Check back later for new content!
            </p>
          </div>
        ) : (
          <PostList 
            initialPosts={data.posts} 
            initialPagination={data.pagination}
          />
        )}
      </div>
    </div>
  )
}