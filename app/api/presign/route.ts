import { NextResponse } from 'next/server'

const API_GATEWAY_URL = 'https://q8b715g1b0.execute-api.ap-south-1.amazonaws.com/default/presigner-lambda'

// Allow CORS
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename')

        console.log('[API] Presign request received for:', filename)

        if (!filename) {
            console.error('[API] No filename provided')
            return NextResponse.json(
                { error: 'Filename is required' },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                }
            )
        }

        console.log('[API] Calling AWS API Gateway...')

        // Call AWS API Gateway to get presigned URL
        const apiUrl = `${API_GATEWAY_URL}?filename=${encodeURIComponent(filename)}`
        console.log('[API] URL:', apiUrl)

        const response = await fetch(apiUrl, {
            method: 'GET',
        })

        console.log('[API] Gateway response status:', response.status)

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[API] Gateway error:', errorText)
            throw new Error(`API Gateway returned ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log('[API] Success! Got presigned URL')

        return NextResponse.json(data, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        })
    } catch (error) {
        console.error('[API] Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('[API] Error details:', errorMessage)

        return NextResponse.json(
            {
                error: 'Failed to generate upload URL',
                details: errorMessage
            },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            }
        )
    }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    })
}
