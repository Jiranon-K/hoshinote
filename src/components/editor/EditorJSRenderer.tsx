'use client'

import { OutputData } from '@editorjs/editorjs'
import Image from 'next/image'
import { useState } from 'react'

interface EditorJSRendererProps {
  data: OutputData | string
  className?: string
}

interface BlockData {
  id?: string
  type: string
  data: {
    text?: string
    level?: number
    style?: string
    items?: string[] | { text: string; checked: boolean }[]
    caption?: string
    code?: string
    content?: string[][]
    file?: { url: string }
    [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export default function EditorJSRenderer({ data, className = '' }: EditorJSRendererProps) {
  // Parse JSON string if needed
  let parsedData: OutputData
  try {
    parsedData = typeof data === 'string' ? JSON.parse(data) : data
  } catch {
    return <div className={className}>Invalid content format.</div>
  }
  
  if (!parsedData || !parsedData.blocks || parsedData.blocks.length === 0) {
    return <div className={className}>No content available.</div>
  }

  const renderBlock = (block: BlockData) => {
    const { type, data: blockData } = block

    switch (type) {
      case 'paragraph':
        return (
          <p 
            className="mb-4 leading-relaxed text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: (blockData.text as string) || '' }}
          />
        )

      case 'header':
        const level = (blockData.level as number) || 2
        const headerClasses = {
          1: 'text-4xl font-bold mb-6 mt-8 text-gray-900 dark:text-gray-100',
          2: 'text-3xl font-bold mb-5 mt-7 text-gray-900 dark:text-gray-100', 
          3: 'text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-100',
          4: 'text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-gray-100'
        }
        
        const className = headerClasses[level as keyof typeof headerClasses]
        const text = (blockData.text as string) || ''
        
        if (level === 1) {
          return <h1 className={className} dangerouslySetInnerHTML={{ __html: text }} />
        } else if (level === 2) {
          return <h2 className={className} dangerouslySetInnerHTML={{ __html: text }} />
        } else if (level === 3) {
          return <h3 className={className} dangerouslySetInnerHTML={{ __html: text }} />
        } else {
          return <h4 className={className} dangerouslySetInnerHTML={{ __html: text }} />
        }

      case 'list':
        const ListTag = blockData.style === 'ordered' ? 'ol' : 'ul'
        const listClasses = blockData.style === 'ordered' 
          ? 'list-decimal list-inside mb-4 ml-4 space-y-2'
          : 'list-disc list-inside mb-4 ml-4 space-y-2'
        
        const items = blockData.items as string[] || []
        
        return (
          <ListTag className={listClasses}>
            {items.map((item: string, index: number) => (
              <li 
                key={index} 
                className="text-gray-900 dark:text-gray-100 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </ListTag>
        )

      case 'checklist':
        const checkItems = blockData.items as { text: string; checked: boolean }[] || []
        
        return (
          <div className="mb-4 space-y-2">
            {checkItems.map((item: { text: string; checked: boolean }, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  readOnly
                  className="mt-1 rounded border-gray-300"
                />
                <span 
                  className={`text-gray-900 dark:text-gray-100 leading-relaxed ${item.checked ? 'line-through text-gray-500' : ''}`}
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            ))}
          </div>
        )

      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-6 py-4 mb-6 bg-gray-50 dark:bg-gray-800 rounded-r-lg">
            <p 
              className="text-lg italic text-gray-700 dark:text-gray-300 mb-2"
              dangerouslySetInnerHTML={{ __html: (blockData.text as string) || '' }}
            />
            {blockData.caption && (
              <cite 
                className="text-sm text-gray-600 dark:text-gray-400"
                dangerouslySetInnerHTML={{ __html: `— ${blockData.caption as string}` }}
              />
            )}
          </blockquote>
        )

      case 'code':
        return (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
            <code>{(blockData.code as string) || ''}</code>
          </pre>
        )

      case 'delimiter':
        return (
          <div className="flex justify-center my-8">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        )

      case 'table':
        const tableContent = blockData.content as string[][] || []
        
        return (
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg">
              <tbody>
                {tableContent.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className="border-b border-gray-300 dark:border-gray-600">
                    {row.map((cell: string, cellIndex: number) => (
                      <td 
                        key={cellIndex}
                        className="border-r border-gray-300 dark:border-gray-600 p-3 text-gray-900 dark:text-gray-100 last:border-r-0"
                        dangerouslySetInnerHTML={{ __html: cell }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'image':
        return <ImageBlock data={blockData} />

      case 'linkTool':
        return (
          <div className="mb-4">
            <a 
              href={blockData.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                {blockData.meta?.title || blockData.link}
              </div>
              {blockData.meta?.description && (
                <div className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  {blockData.meta.description}
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {blockData.link}
              </div>
            </a>
          </div>
        )

      default:
        console.warn(`Unknown block type: ${type}`)
        return null
    }
  }

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {parsedData.blocks.map((block: BlockData, index: number) => (
        <div key={block.id || index}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  )
}

// Separate component for image blocks to handle loading states
function ImageBlock({ data }: { data: { file?: { url: string }; caption?: string } }) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  if (!data.file?.url) {
    return null
  }

  return (
    <figure className="my-8">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        )}
        
        {!imageError ? (
          <Image
            src={data.file.url}
            alt={data.caption || 'Blog post image'}
            width={800}
            height={600}
            className="w-full h-auto object-cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-200 dark:bg-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Failed to load image</span>
          </div>
        )}
      </div>
      
      {data.caption && (
        <figcaption 
          className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400 italic"
          dangerouslySetInnerHTML={{ __html: data.caption }}
        />
      )}
    </figure>
  )
}