import Link from 'next/link'
import { Upload, Image as ImageIcon, Zap } from 'lucide-react'
import SplineHero from '@/components/SplineHero'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section with Spline Background */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Spline 3D scene as full background */}
        <div className="absolute inset-0 w-full h-full">
          <SplineHero
            url="https://my.spline.design/worldplanet-FrjelJOWDBwB5ypHZ0Xfb8Hu/"
            height="100%"
            className="w-full h-full"
          />
        </div>
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950/80" />
        
        {/* Hero content overlaid on Spline */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-900/50 backdrop-blur-sm text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-800/50 hover:scale-105 transition-transform duration-300 cursor-default">
              <Zap className="w-4 h-4" />
              <span>Powered by AWS Serverless</span>
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
              Optimize Your Images
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Instantly & Effortlessly
              </span>
            </h1>
            
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Upload images and get automatically resized versions in multiple sizes. 
              Fast, scalable, and powered by AWS Lambda.
            </p>

            <div className="flex gap-4 justify-center">
              <Link 
                href="/upload"
                className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-2xl backdrop-blur-sm"
              >
                <Upload className="w-5 h-5" />
                Upload Image
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              
              <Link 
                href="/gallery"
                className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border-2 border-gray-700 hover:border-gray-600 flex items-center gap-2 shadow-2xl"
              >
                <ImageIcon className="w-5 h-5" />
                View Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content section below hero */}
      <div className="container mx-auto px-4 py-20">
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-blue-500 transition-all">
            <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Easy Upload</h3>
            <p className="text-gray-400 leading-relaxed">
              Drag and drop or click to upload. Secure presigned URLs ensure safe transfers to AWS S3.
            </p>
          </div>

          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-purple-500 transition-all">
            <div className="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Auto Resize</h3>
            <p className="text-gray-400 leading-relaxed">
              Lambda automatically creates thumb (100px), medium (500px), and large (1000px) versions.
            </p>
          </div>

          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-green-500 transition-all">
            <div className="w-12 h-12 bg-green-900/50 rounded-xl flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">Instant Gallery</h3>
            <p className="text-gray-400 leading-relaxed">
              View all your optimized images in a beautiful gallery with download options.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-24 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4 font-semibold">Powered By</p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-500">
            <span className="font-semibold">AWS S3</span>
            <span>•</span>
            <span className="font-semibold">AWS Lambda</span>
            <span>•</span>
            <span className="font-semibold">API Gateway</span>
            <span>•</span>
            <span className="font-semibold">Next.js 13</span>
            <span>•</span>
            <span className="font-semibold">TailwindCSS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
