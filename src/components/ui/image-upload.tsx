'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toaster'

interface ImageUploadProps {
  onUpload: (url: string) => void
  currentImage?: string
  onRemove?: () => void
  className?: string
  label?: string
}

export default function ImageUpload({ 
  onUpload, 
  currentImage, 
  onRemove, 
  className = '',
  label = 'Upload Image'
}: ImageUploadProps) {
  const { push: toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError('')

    
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      setIsUploading(false)
      return
    }

  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      setIsUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        onUpload(result.url)
        setError('') // Clear any previous errors
        toast({
          type: 'success',
          title: 'Image uploaded!',
          description: 'Your image has been uploaded successfully.'
        })
      } else {
        const errorMsg = result.error || 'Upload failed'
        setError(errorMsg)
        toast({
          type: 'error',
          title: 'Upload failed',
          description: errorMsg
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMsg = 'Network error. Please check your connection and try again.'
      setError(errorMsg)
      toast({
        type: 'error',
        title: 'Upload error',
        description: errorMsg
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>{label}</Label>
      
      {currentImage ? (
        <div className="space-y-3">
          <div className="relative h-48 w-full max-w-md bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-200">
            <img
              src={currentImage}
              alt="Uploaded image"
              className="h-full w-full object-cover object-center"
              onError={() => setError('Failed to load image preview')}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={isUploading}
            >
              Replace
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="space-y-2">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Click to upload
                  </button>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP, GIF up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}