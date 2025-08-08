'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { postSchema, type PostInput } from '@/lib/validations'

interface PostFormProps {
  initialData?: Partial<PostInput & { _id?: string }>
  isEditing?: boolean
}

export default function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState(initialData?.content || '')
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      excerpt: initialData?.excerpt || '',
      coverImage: initialData?.coverImage || '',
      tags: initialData?.tags || [],
      categories: initialData?.categories || [],
      status: initialData?.status || 'draft'
    }
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    if (!isEditing) {
      const slug = generateSlug(title)
      setValue('slug', slug)
    }
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
    setValue('tags', tags)
  }

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
    setValue('categories', categories)
  }

  const onSubmit = async (data: PostInput) => {
    setIsLoading(true)
    setError('')

    try {
      const payload = {
        ...data,
        content
      }

      const url = isEditing 
        ? `/api/posts/${initialData?._id}`
        : '/api/posts'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        router.push('/dashboard/posts')
        router.refresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save post')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const watchedTags = watch('tags')
  const watchedCategories = watch('categories')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  {...register('title')}
                  onChange={(e) => {
                    register('title').onChange(e)
                    handleTitleChange(e)
                  }}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  {...register('slug')}
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Input
                id="excerpt"
                placeholder="Brief description of your post"
                {...register('excerpt')}
              />
              {errors.excerpt && (
                <p className="text-sm text-red-600">{errors.excerpt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL (Optional)</Label>
              <Input
                id="coverImage"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register('coverImage')}
              />
              {errors.coverImage && (
                <p className="text-sm text-red-600">{errors.coverImage.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="javascript, react, nextjs"
                  defaultValue={watchedTags?.join(', ') || ''}
                  onChange={handleTagsChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categories">Categories (comma-separated)</Label>
                <Input
                  id="categories"
                  placeholder="technology, programming"
                  defaultValue={watchedCategories?.join(', ') || ''}
                  onChange={handleCategoriesChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor 
                content={content}
                onChange={setContent}
                placeholder="Start writing your post..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    setValue('status', value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !content.trim()}
                >
                  {isLoading 
                    ? (isEditing ? 'Updating...' : 'Creating...') 
                    : (isEditing ? 'Update Post' : 'Create Post')
                  }
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}