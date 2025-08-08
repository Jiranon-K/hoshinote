import { notFound } from 'next/navigation'
import PostForm from '@/components/dashboard/PostForm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/database'
import { Post } from '@/models'

interface PageProps {
  params: {
    id: string
  }
}

async function getPost(id: string, userId: string, userRole: string) {
  try {
    await dbConnect()
    
    const filter = userRole === 'admin' ? { _id: id } : { _id: id, author: userId }
    const post = await Post.findOne(filter).lean()
    
    if (!post) {
      return null
    }

    const postData = post as any

    return {
      _id: postData._id.toString(),
      title: postData.title,
      slug: postData.slug,
      content: postData.content,
      excerpt: postData.excerpt,
      coverImage: postData.coverImage || '',
      tags: postData.tags || [],
      categories: postData.categories || [],
      status: postData.status
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function EditPostPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return notFound()
  }
  
  const post = await getPost(params.id, session.user.id, session.user.role)
  
  if (!post) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600">
          Make changes to your blog post.
        </p>
      </div>
      
      <PostForm initialData={post} isEditing={true} />
    </div>
  )
}