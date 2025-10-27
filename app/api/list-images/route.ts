import { NextResponse } from 'next/server'

// Always compute fresh list; avoid any caching
export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'image-resizer-demo-sriram'
const REGION = 'ap-south-1'

// Simple fetch-based solution for public S3 buckets
export async function GET() {
    try {
        console.log('========================================')
        console.log('[LIST] API ROUTE CALLED!')
        console.log('[LIST] Fetching images from S3 (public bucket)...')
        console.log('========================================')

        // Use S3 REST API to list objects (works with public buckets)
        const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/?list-type=2&prefix=resized/&max-keys=100`

        console.log('[LIST] Fetching from:', url)

        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
        })

        if (!response.ok) {
            console.error('[LIST] S3 API error:', response.status, response.statusText)
            throw new Error(`S3 API returned ${response.status}`)
        }

        const xmlText = await response.text()
        console.log('[LIST] Got XML response')

        // Parse XML to extract image keys
        const keyRegex = /<Key>(.*?)<\/Key>/g
        const sizeRegex = /<Size>(\d+)<\/Size>/g
        const dateRegex = /<LastModified>(.*?)<\/LastModified>/g

        const keys: string[] = []
        const sizes: number[] = []
        const dates: string[] = []

        let match
        while ((match = keyRegex.exec(xmlText)) !== null) {
            keys.push(match[1])
        }
        while ((match = sizeRegex.exec(xmlText)) !== null) {
            sizes.push(parseInt(match[1]))
        }
        while ((match = dateRegex.exec(xmlText)) !== null) {
            dates.push(match[1])
        }

        console.log('[LIST] Found', keys.length, 'objects')

        // Transform to image items
        const images = keys
            .filter((key) => {
                // Exclude the folder itself and non-image files (case-insensitive extensions)
                const k = key.toLowerCase()
                return key !== 'resized/' &&
                    (k.endsWith('.jpg') || k.endsWith('.jpeg') ||
                        k.endsWith('.png') || k.endsWith('.gif') ||
                        k.endsWith('.webp'))
            })
            .map((key, index) => {
                const fileName = key.replace('resized/', '')
                const size = fileName.startsWith('thumb_') ? 'thumb'
                    : fileName.startsWith('medium_') ? 'medium'
                        : fileName.startsWith('large_') ? 'large'
                            : 'original'

                const rawUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`
                return {
                    name: fileName,
                    // Encode spaces and special characters but keep slashes
                    url: encodeURI(rawUrl),
                    size,
                    timestamp: dates[index] || new Date().toISOString(),
                }
            })
            .sort((a, b) => {
                // Sort by timestamp, newest first
                const dateA = new Date(a.timestamp).getTime()
                const dateB = new Date(b.timestamp).getTime()
                return dateB - dateA
            })

        console.log('[LIST] Returning', images.length, 'images')
        return NextResponse.json({ images })
    } catch (error) {
        console.error('[LIST] Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        return NextResponse.json(
            {
                error: 'Failed to list images',
                details: errorMessage,
                images: []
            },
            { status: 500 }
        )
    }
}
