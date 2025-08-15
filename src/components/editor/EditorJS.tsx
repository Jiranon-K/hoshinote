'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'

import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
// @ts-expect-error - CheckList module types are incomplete
import CheckList from '@editorjs/checklist'
import Code from '@editorjs/code'
import ImageTool from '@editorjs/image'
import Table from '@editorjs/table'
import InlineCode from '@editorjs/inline-code'
import LinkTool from '@editorjs/link'

interface EditorJSProps {
  data?: OutputData | null
  onChange?: (data: OutputData) => void
  placeholder?: string
  readOnly?: boolean
}

export default function EditorJSComponent({ 
  data, 
  onChange, 
  placeholder = "Let's write something awesome...", 
  readOnly = false 
}: EditorJSProps) {
  const ejInstance = useRef<EditorJS | null>(null)
  const [, setIsReady] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Custom image upload function
  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (response.ok) {
        return {
          success: 1,
          file: {
            url: result.url,
          }
        }
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      return {
        success: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  // Upload by URL function
  const uploadByUrl = async (url: string) => {
    return {
      success: 1,
      file: {
        url: url,
      }
    }
  }

  const initEditor = useCallback(() => {
    if (ejInstance.current) {
      return
    }

    try {
      const editor = new EditorJS({
        holder: 'editorjs',
        onReady: () => {
          setIsReady(true)
        },
        onChange: async () => {
          if (!onChange) return
          
          try {
            const content = await editor.save()
            onChange(content)
          } catch (error) {
            console.error('Error getting editor content:', error)
          }
        },
        autofocus: !readOnly,
        readOnly: readOnly,
        data: data || undefined,
        placeholder: placeholder,
        minHeight: 300,
        tools: {
          header: {
            // @ts-expect-error - Header tool types are incomplete
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            // @ts-expect-error - List tool types are incomplete
            class: List,
            config: {
              defaultStyle: 'unordered'
            }
          },
          checklist: {
            class: CheckList
          },
          quote: {
            class: Quote,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author',
            }
          },
          code: {
            class: Code,
            config: {
              placeholder: 'Enter code here...'
            }
          },
          delimiter: {
            class: Delimiter
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: uploadImage,
                uploadByUrl: uploadByUrl,
              },
              captionPlaceholder: 'Enter image caption...',
            }
          },
          table: {
            class: Table,
            config: {
              rows: 2,
              cols: 3,
            }
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+M'
          },
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/fetchUrl',
            }
          }
        }
      })

      ejInstance.current = editor
    } catch (error) {
      console.error('Failed to initialize Editor.js:', error)
    }
  }, [data, onChange, placeholder, readOnly])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    
    initEditor()

    return () => {
      if (ejInstance.current && ejInstance.current.destroy) {
        ejInstance.current.destroy()
        ejInstance.current = null
        setIsReady(false)
      }
    }
  }, [isMounted, initEditor])

  if (!isMounted) {
    return (
      <div className="border rounded-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div 
        id="editorjs" 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none border rounded-lg p-4 min-h-[300px] focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-colors"
      />
    </div>
  )
}