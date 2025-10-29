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

        // Parse per <Contents> block to keep metadata aligned
        const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g
        const images = [] as Array<{ name: string; url: string; size: string; timestamp: string }>

        let contentMatch: RegExpExecArray | null
        while ((contentMatch = contentsRegex.exec(xmlText)) !== null) {
            const block = contentMatch[1]
            const keyMatch = /<Key>(.*?)<\/Key>/.exec(block)
            const dateMatch = /<LastModified>(.*?)<\/LastModified>/.exec(block)
            // const sizeMatch = /<Size>(\d+)<\/Size>/.exec(block) // not used in UI

            if (!keyMatch) continue
            const key = keyMatch[1]
            const kLower = key.toLowerCase()
            // Filter to images under resized/
            if (
                key === 'resized/' ||
                !key.startsWith('resized/') ||
                !(kLower.endsWith('.jpg') || kLower.endsWith('.jpeg') || kLower.endsWith('.png') || kLower.endsWith('.gif') || kLower.endsWith('.webp'))
            ) {
                continue
            }

            const fileName = key.replace('resized/', '')
            const sizeLabel = fileName.startsWith('thumb_')
                ? 'thumb'
                : fileName.startsWith('medium_')
                    ? 'medium'
                    : fileName.startsWith('large_')
                        ? 'large'
                        : 'original'

            const rawUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`
            images.push({
                name: fileName,
                url: encodeURI(rawUrl),
                size: sizeLabel,
                timestamp: (dateMatch && dateMatch[1]) || new Date().toISOString(),
            })
        }

        // Sort by timestamp desc
        images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        console.log('[LIST] Returning', images.length, 'images')

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
