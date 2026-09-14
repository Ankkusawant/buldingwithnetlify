'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Inner component that uses the useSearchParams() hook
function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Missing verification token')
      return
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (r) => {
        const data = await r.json()
        if (r.ok) {
          setStatus('success')
          setMessage('Email verified successfully')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Network error')
      })
  }, [token, router])

  return (
    <div className="w-full max-w-sm text-center space-y-4">
      {status === 'loading' && <p className="text-gray-500">Verifying…</p>}
      {status === 'success' && (
        <>
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-bold">Email verified</h1>
          <p className="text-gray-600">{message}</p>
          <p className="text-sm text-gray-400">Redirecting…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl">❌</div>
          <h1 className="text-2xl font-bold">Verification failed</h1>
          <p className="text-red-600 text-sm">{message}</p>
          <Link href="/dashboard" className="inline-block text-blue-600 underline text-sm">
            Back to dashboard
          </Link>
        </>
      )}
    </div>
  )
}

// Default export wraps the content in Suspense
export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  )
}