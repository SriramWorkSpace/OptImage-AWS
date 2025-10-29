'use client'

import { useEffect, useState } from 'react'

type Props = {
  url?: string
  className?: string
  height?: number | string
}

/**
 * SplineHero renders a Spline 3D scene if a URL is provided.
 * Source the URL from NEXT_PUBLIC_SPLINE_SCENE_URL or pass via props.
 * Falls back to an iframe until the web component script is ready.
 */
export default function SplineHero({
  url = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL || '',
  className,
  height = 500,
}: Props) {
  const [viewerReady, setViewerReady] = useState(false)
  const isSplineCode = !!url && (/\.splinecode(\?|$)/.test(url) || url.includes('/scene.splinecode'))

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!url) return
    if (!isSplineCode) return // Use iframe for non-splinecode embeds

    // Avoid injecting the script multiple times across navigations
    const existing = document.querySelector('script[data-spline-viewer]')
    if (existing) {
      setViewerReady(true)
      return
    }

    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://unpkg.com/@splinetool/viewer@1.9.53/build/spline-viewer.js'
    script.async = true
    script.setAttribute('data-spline-viewer', 'true')
    script.onload = () => setViewerReady(true)
    script.onerror = () => setViewerReady(false)
    document.head.appendChild(script)
  }, [url, isSplineCode])

  if (!url) return null

  const style: React.CSSProperties = {
    width: '100%',
    height: typeof height === 'number' ? `${height}px` : height,
    display: 'block',
  }

  return (
    <div className={className}>
      {isSplineCode && viewerReady ? (
        // Web component (best quality & controls)
        // eslint-disable-next-line react/no-unknown-property
        <spline-viewer url={url} style={style} />
      ) : (
        // Fallback iframe while script loads
        <iframe
          src={url}
          title="Spline scene"
          style={style}
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      )}
    </div>
  )
}
