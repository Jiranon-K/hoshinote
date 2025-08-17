import { MetadataRoute } from 'next'
import dbConnect from '@/lib/database'
import { Post } from '@/models'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://note.hoshizora.online'
  
  try {
    await dbConnect()
    
    // Get all published posts
    const posts = await Post.find({ status: 'published' })
      .select('slug updatedAt')
      .lean()
    
    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/auth/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/auth/register`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
    ]
    
    // Dynamic blog post pages
    const postPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    
    return [...staticPages, ...postPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return basic sitemap if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
    ]
  }
}