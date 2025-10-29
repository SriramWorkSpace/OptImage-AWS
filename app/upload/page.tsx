'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setFile(selectedFile)
    setError(null)
    setSuccess(false)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileChange(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      console.log('Getting presigned URL for:', file.name)
      
      // Get presigned URL from our API route
      const response = await fetch(`/api/presign?filename=${encodeURIComponent(file.name)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Presign API error:', errorData)
        throw new Error(errorData.error || 'Failed to get upload URL')
      }

      const data = await response.json()
      console.log('Got presigned URL')

      if (!data.url) {
        throw new Error('No upload URL received from server')
      }

      // Upload directly to S3 using presigned URL
      console.log('Uploading to S3...')
      const uploadResponse = await fetch(data.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      console.log('Upload response status:', uploadResponse.status)

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('S3 upload error:', errorText)
        throw new Error(`Failed to upload to S3 (Status: ${uploadResponse.status}). This is likely a CORS issue. Check S3-CORS-FIX.md for solution.`)
      }

      console.log('Upload successful!')
      setSuccess(true)
      setFile(null)
      setPreview(null)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Upload Your Image</h1>
          <p className="text-gray-400">
            Upload an image to automatically generate optimized versions in multiple sizes
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 mb-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 hover:border-blue-600 hover:bg-gray-800/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />

            {!preview ? (
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-300 mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, GIF, WebP
                </p>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative mx-auto rounded-lg border border-gray-700 overflow-hidden" style={{ width: '100%', maxWidth: 512, height: 256 }}>
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain bg-gray-950"
                    sizes="(max-width: 640px) 100vw, 512px"
                    priority
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <ImageIcon className="w-5 h-5" />
                  <span className="font-medium">{file?.name}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-sm text-gray-500">
                    {file && (file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  Choose a different image
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {file && !success && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Optimize
                </>
              )}
            </button>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-6 bg-green-900/20 border border-green-700 rounded-xl p-6 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-400 mb-1">Upload Successful!</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Your image is being processed. Resized versions will be available in a few seconds.
                </p>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 text-green-400 font-medium hover:text-green-300"
                >
                  View in Gallery →
                </Link>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-900/20 border border-red-700 rounded-xl p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Upload Failed</h3>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-2xl font-bold text-blue-400 mb-2">100px</div>
            <div className="text-sm text-gray-400">Thumbnail size</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-2xl font-bold text-purple-400 mb-2">500px</div>
            <div className="text-sm text-gray-400">Medium size</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-2xl font-bold text-pink-400 mb-2">1000px</div>
            <div className="text-sm text-gray-400">Large size</div>
          </div>
        </div>
      </div>
    </div>
  )
}
