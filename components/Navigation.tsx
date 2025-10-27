'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Image as ImageIcon } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">OI</span>
            </div>
            <span className="text-xl font-bold text-white">
              OptImage
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/')
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/upload"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/upload')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Upload
            </Link>
            <Link
              href="/gallery"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/gallery')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              Gallery
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
