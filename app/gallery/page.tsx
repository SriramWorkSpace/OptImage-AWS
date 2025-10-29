'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Download, Loader2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'

interface ImageItem {
  name: string
  url: string
  size: 'thumb' | 'medium' | 'large' | 'original'
  timestamp?: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'thumb' | 'medium' | 'large'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadImages = async () => {
    setLoading(true)
    setError(null)

    try {
      // Note: You'll need to create an API route to list S3 objects
      // For now, this is a placeholder that shows the UI structure
      const response = await fetch('/api/list-images')
      
      if (!response.ok) {
        throw new Error('Failed to load images')
      }

      const data = await response.json()
      setImages(data.images || [])
    } catch (err) {
      console.error('Error loading images:', err)
      setError('Failed to load images. Please make sure the API route is set up.')
      // For demo purposes, you might want to set some mock data here
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (imageName: string) => {
    if (!confirm(`Are you sure you want to delete ${imageName}? This will delete all sizes (thumb, medium, large).`)) {
      return
    }

    setDeleting(imageName)

    try {
      const response = await fetch(`/api/delete-image?name=${encodeURIComponent(imageName)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete image')
      }

      // Remove the deleted images from the list
      setImages(prevImages => prevImages.filter(img => {
        const baseName = img.name.replace(/^(thumb_|medium_|large_)/, '')
        const targetBaseName = imageName.replace(/^(thumb_|medium_|large_)/, '')
        return baseName !== targetBaseName
      }))

      console.log('Image deleted successfully')
    } catch (err) {
      console.error('Error deleting image:', err)
      alert(`Failed to delete image: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    loadImages()
  }, [])

  const filteredImages = images.filter(
    img => filter === 'all' || img.size === filter
  )

  const getSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      thumb: 'Thumbnail (100px)',
      medium: 'Medium (500px)',
      large: 'Large (1000px)',
      original: 'Original'
    }
    return labels[size] || size
  }

  const getSizeColor = (size: string) => {
    const colors: Record<string, string> = {
      thumb: 'bg-blue-900/50 text-blue-400 border border-blue-800',
      medium: 'bg-purple-900/50 text-purple-400 border border-purple-800',
      large: 'bg-pink-900/50 text-pink-400 border border-pink-800',
      original: 'bg-gray-800 text-gray-400 border border-gray-700'
    }
    return colors[size] || 'bg-gray-800 text-gray-400 border border-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Image Gallery</h1>
          <p className="text-gray-400">
            View all your uploaded and optimized images
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Sizes
              </button>
              <button
                onClick={() => setFilter('thumb')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'thumb'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Thumbnails
              </button>
              <button
                onClick={() => setFilter('medium')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'medium'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setFilter('large')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'large'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Large
              </button>
            </div>
            
            <button
              onClick={loadImages}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium text-gray-300 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading images...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Gallery Setup Required</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-left text-sm">
              <p className="font-semibold mb-2 text-gray-300">To enable the gallery, you need to:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Create an AWS SDK configuration with your credentials</li>
                <li>Add an API route at <code className="bg-gray-800 px-2 py-1 rounded">/api/list-images</code></li>
                <li>Use AWS SDK to list objects from the S3 bucket&#39;s <code className="bg-gray-800 px-2 py-1 rounded">resized/</code> folder</li>
              </ol>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && images.length === 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No images yet</h3>
            <p className="text-gray-400 mb-6">Upload your first image to see it here</p>
            <a
              href="/upload"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Upload Image
            </a>
          </div>
        )}

        {/* Image Grid */}
        {!loading && !error && filteredImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all group"
              >
                <div className="aspect-square bg-gray-950 relative overflow-hidden">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    priority={false}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white truncate flex-1">
                      {image.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getSizeColor(image.size)}`}>
                      {image.size}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{getSizeLabel(image.size)}</p>
                  <div className="flex gap-2">
                    <a
                      href={image.url}
                      download
                      className="flex items-center justify-center gap-2 flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 rounded-lg font-medium transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button
                      onClick={() => handleDelete(image.name)}
                      disabled={deleting === image.name}
                      className="flex items-center justify-center gap-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium transition-all"
                      title="Delete all sizes"
                    >
                      {deleting === image.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && !error && images.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            Showing {filteredImages.length} of {images.length} images
          </div>
        )}
      </div>
    </div>
  )
}
