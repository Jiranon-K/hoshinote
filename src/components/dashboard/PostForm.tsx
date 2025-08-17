'use client'

import { useState, useEffect } from 'react'
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
import TipTapEditor from '@/components/editor/TipTapEditor'
import ImageUpload from '@/components/ui/image-upload'
import { postSchema, type PostInput } from '@/lib/validations'

interface PostFormProps {
  initialData?: Partial<PostInput & { _id?: string; content?: string }>
  isEditing?: boolean
}

export default function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState<string>(
    initialData?.content || ''
  )
  const [imagePreview, setImagePreview] = useState(initialData?.coverImage || '')
  const [imageError, setImageError] = useState(false)
  
  const form = useForm({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      coverImage: initialData?.coverImage || '',
      tags: initialData?.tags || [],
      categories: initialData?.categories || [],
      status: (initialData?.status || 'draft') as 'draft' | 'published' | 'archived'
    }
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form

  // Sync content state with form
  useEffect(() => {
    setValue('content', content)
  }, [content, setValue])

  // Generate random slug for new posts
  useEffect(() => {
    if (!isEditing && !initialData?.slug) {
      const randomSlug = generateRandomSlug()
      setValue('slug', randomSlug)
    }
  }, [isEditing, initialData?.slug, setValue])

  const generateRandomSlug = () => {
    const randomStr1 = Math.random().toString(36).substring(2, 8)
    const randomStr2 = Math.random().toString(36).substring(2, 6)
    return `${randomStr1}${randomStr2}`
  }


  const handleTitleChange = () => {
    // For new posts, we keep the auto-generated random slug
    // Title changes don't affect the slug anymore
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
    setValue('tags', tags)
  }

  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value.split(',').map(cat => cat.trim()).filter(Boolean)
    setValue('categories', categories)
  }

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    console.log('Image URL changed:', url)
    setValue('coverImage', url)
    setImagePreview(url)
    setImageError(false)
  }


  const removeImage = () => {
    setValue('coverImage', '')
    setImagePreview('')
    setImageError(false)
  }

  const onSubmit = async (data: PostInput) => {
    setIsLoading(true)
    setError('')

    try {
      const payload = {
        ...data,
        content: content
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
        setError(errorData.error || `Failed to save post (${response.status})`)
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const watchedTags = watch('tags')
  const watchedCategories = watch('categories')

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
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

            {Object.keys(errors).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                <p className="font-medium mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="text-sm">
                      <strong>{field}:</strong> {error?.message || 'Invalid value'}
                    </li>
                  ))}
                </ul>
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
                    handleTitleChange()
                  }}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug {!isEditing && <span className="text-xs text-gray-500">(Auto-generated)</span>}
                </Label>
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  {...register('slug')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug.message}</p>
                )}
                {!isEditing && (
                  <p className="text-xs text-gray-500">
                    🔒 Slug is automatically generated and cannot be edited for new posts
                  </p>
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

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <ImageUpload
                    label="Cover Image Upload"
                    currentImage={imagePreview}
                    onUpload={(url) => {
                      console.log('Image uploaded:', url)
                      setValue('coverImage', url)
                      setImagePreview(url)
                      setImageError(false)
                    }}
                    onRemove={removeImage}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Or paste image URL</Label>
                    <Input
                      id="coverImage"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      {...register('coverImage')}
                      onChange={handleImageUrlChange}
                    />
                    {errors.coverImage && (
                      <p className="text-sm text-red-600">{errors.coverImage.message}</p>
                    )}
                  </div>

                  {imagePreview && imageError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Failed to load image. Please check the URL.</span>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500 space-y-1">
                    <p>💡 Upload images directly or use external URLs</p>
                    <p>📸 Images are automatically optimized via Cloudflare R2</p>
                  </div>
                </div>
              </div>
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
              <TipTapEditor 
                content={content}
                onChange={setContent}
                placeholder="Start writing your post..."
              />
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content.message}</p>
              )}
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
                  disabled={isLoading}
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