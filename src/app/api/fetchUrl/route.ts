import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { success: 0, error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: 0, error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Fetch the URL to get meta information
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HoshiLog/1.0)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      return NextResponse.json(
        { success: 0, error: 'Failed to fetch URL' },
        { status: 400 }
      )
    }

    const html = await response.text()
    
    // Extract basic meta information
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) ||
                           html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)
    
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname
    const description = descriptionMatch ? descriptionMatch[1].trim() : ''

    return NextResponse.json({
      success: 1,
      meta: {
        title,
        description,
        image: {
          url: ''
        }
      }
    })
  } catch (error) {
    console.error('Error fetching URL:', error)
    return NextResponse.json(
      { success: 0, error: 'Failed to fetch URL metadata' },
      { status: 500 }
    )
  }
}