import { NextResponse } from 'next/server'

const BUCKET_NAME = 'image-resizer-demo-sriram'
const REGION = 'ap-south-1'

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const imageName = searchParams.get('name')

        if (!imageName) {
            return NextResponse.json(
                { error: 'Image name is required' },
                { status: 400 }
            )
        }

        console.log('[DELETE] Deleting image:', imageName)

        // Extract base name without size prefix
        const baseName = imageName.replace(/^(thumb_|medium_|large_)/, '')

        // Delete all three sizes
        const sizes = ['thumb_', 'medium_', 'large_']
        const deletePromises = sizes.map(async (prefix) => {
            const key = `resized/${prefix}${baseName}`
            const rawUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`
            const url = encodeURI(rawUrl)

            console.log('[DELETE] Attempting to delete:', url)

            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                })

                if (response.ok || response.status === 204) {
                    console.log('[DELETE] Successfully deleted:', key)
                    return { key, success: true }
                } else {
                    console.error('[DELETE] Failed to delete:', key, response.status)
                    return { key, success: false, status: response.status }
                }
            } catch (error) {
                console.error('[DELETE] Error deleting:', key, error)
                return { key, success: false, error }
            }
        })

        const results = await Promise.all(deletePromises)
        const allSuccessful = results.every(r => r.success)

        if (allSuccessful) {
            return NextResponse.json({
                message: 'Image deleted successfully',
                results
            })
        } else {
            return NextResponse.json(
                {
                    error: 'Some images could not be deleted',
                    results
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('[DELETE] Error:', error)
        return NextResponse.json(
            {
                error: 'Failed to delete image',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
