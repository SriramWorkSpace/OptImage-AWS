import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OptImage - Cloud Image Optimizer',
  description: 'Serverless image resizing and optimization powered by AWS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950`}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 border-t border-gray-800 py-6">
          <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
            <p>Built by <span className="text-blue-400 font-medium">Sriram Madala</span></p>
          </div>
        </footer>
      </body>
    </html>
  )
}
