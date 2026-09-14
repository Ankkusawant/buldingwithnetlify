'use client'
import { useEffect, useState } from 'react'

type User = {
  id: string
  email: string
  name: string | null
  phone: string | null
  upiId: string | null
  referralCode: string
  status: string
  role: string
  emailVerified?: boolean
  phoneVerified?: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', upiId: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    if (data.user) {
      setUser(data.user)
      setForm({
        name: data.user.name || '',
        phone: data.user.phone || '',
        upiId: data.user.upiId || '',
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error || 'Update failed')
      return
    }
    setMessage('Profile updated')
    await load()
  }

  async function sendVerification() {
    const res = await fetch('/api/auth/verify-email', { method: 'POST' })
    const data = await res.json()
    if (res.ok) setMessage('Verification email sent — check your inbox')
    else setError(data.error || 'Failed to send')
  }

  if (loading) return <p className="p-6">Loading…</p>
  if (!user) return <p className="p-6 text-red-600">Not logged in</p>

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="border rounded-xl p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Email</span>
          <span className="text-sm font-medium">{user.email}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Email verified</span>
          {user.emailVerified ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              ✓ Verified
            </span>
          ) : (
            <button
              onClick={sendVerification}
              className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded hover:bg-amber-200"
            >
              Send verification
            </button>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Referral code</span>
          <span className="text-sm font-mono font-medium">{user.referralCode}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Role</span>
          <span className="text-sm font-medium">{user.role}</span>
        </div>
      </div>

      <form onSubmit={save} className="space-y-3">
        <h2 className="font-semibold pt-2">Edit details</h2>

        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded-lg px-4 py-3"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border rounded-lg px-4 py-3"
        />
        <input
          type="text"
          placeholder="UPI ID (for withdrawals)"
          value={form.upiId}
          onChange={(e) => setForm({ ...form, upiId: e.target.value })}
          className="w-full border rounded-lg px-4 py-3"
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </main>
  )
}