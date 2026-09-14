'use client'
import { useEffect, useState } from 'react'

export default function SurveysPage() {
  const [iframeUrl, setIframeUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/providers/cpx-research/iframe-url')
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) setError(data.error || 'Failed to load surveys')
        else setIframeUrl(data.url)
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Earn with Surveys</h1>
      {loading && <p className="text-gray-500">Loading surveys…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {iframeUrl && (
        <iframe
          src={iframeUrl}
          className="w-full h-[700px] border rounded-xl"
          title="CPX Research Surveys"
        />
      )}
    </main>
  )
}