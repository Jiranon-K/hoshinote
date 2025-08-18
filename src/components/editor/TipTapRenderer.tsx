'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Youtube from '@tiptap/extension-youtube'
import { useState, useEffect } from 'react'

interface TipTapRendererProps {
  content: string
  className?: string
}

export default function TipTapRenderer({ content, className = '' }: TipTapRendererProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        link: false,
        underline: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc list-inside ml-4 space-y-1',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-inside ml-4 space-y-1',
        },
      }),
      ListItem,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline decoration-blue-600 hover:decoration-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'mx-auto my-6 max-w-full',
        },
        width: 640,
        height: 360,
        allowFullscreen: true,
        modestBranding: false,
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: content || '<p>No content available.</p>',
    editable: false,
    editorProps: {
      attributes: {
        class: `prose prose-lg prose-slate max-w-none focus:outline-none ${className}`,
      },
    },
  }, [isClient])

  if (!content) {
    return (
      <div className={`text-gray-500 italic ${className}`}>
        No content available.
      </div>
    )
  }

  if (!isClient) {
    return (
      <div className={`prose prose-lg prose-slate max-w-none ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: content || '<p>No content available.</p>' }} />
      </div>
    )
  }

  if (!editor) {
    return (
      <div className={`prose prose-lg prose-slate max-w-none ${className}`}>
        <div dangerouslySetInnerHTML={{ __html: content || '<p>No content available.</p>' }} />
      </div>
    )
  }

  return (
    <div className={`prose prose-lg prose-slate max-w-none ${className}`}>
      <EditorContent editor={editor} />
    </div>
  )
}