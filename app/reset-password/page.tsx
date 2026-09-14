'use client'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// Inner component that uses the useSearchParams() hook
function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be 6+ characters')
      return
    }
    if (!token) {
      setError('Missing reset token')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Reset failed')
      return
    }
    router.push('/login')
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-bold text-center">Set new password</h1>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <input
        type="password"
        required
        minLength={6}
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded-lg px-4 py-3"
      />
      <input
        type="password"
        required
        minLength={6}
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border rounded-lg px-4 py-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? 'Updating…' : 'Set new password'}
      </button>

      <p className="text-sm text-center text-gray-600">
        <Link href="/login" className="text-black font-medium underline">
          Back to login
        </Link>
      </p>
    </form>
  )
}

// Default export wraps the content in Suspense
export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}