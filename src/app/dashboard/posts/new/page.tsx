import PostForm from '@/components/dashboard/PostForm'

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
        <p className="text-gray-600">
          Write and publish your blog post.
        </p>
      </div>
      
      <PostForm />
    </div>
  )
}