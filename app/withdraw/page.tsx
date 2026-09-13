'use client'
import { useState } from 'react'

export default function WithdrawPage() {
  const [form, setForm] = useState({ amountPoints: '', upiId: '' })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountPoints: parseInt(form.amountPoints),
        upiId: form.upiId,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setMsg(data.error || 'Withdrawal failed')
      return
    }
    setMsg('Withdrawal requested! It will be reviewed by admin.')
    setForm({ amountPoints: '', upiId: '' })
  }

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Withdraw</h1>
      <p className="text-sm text-gray-600">
        Minimum 10,000 points (₹100). Manual review within 24–48 hours.
      </p>

      {msg && <p className="text-sm text-center text-blue-600">{msg}</p>}

      <form onSubmit={submit} className="space-y-4">
        <input
          type="number"
          required
          min={10000}
          placeholder="Points to withdraw"
          value={form.amountPoints}
          onChange={(e) => setForm({ ...form, amountPoints: e.target.value })}
          className="w-full border rounded-lg px-4 py-3"
        />
        <input
          type="text"
          required
          placeholder="UPI ID (example@bank)"
          value={form.upiId}
          onChange={(e) => setForm({ ...form, upiId: e.target.value })}
          className="w-full border rounded-lg px-4 py-3"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Submitting…' : 'Request withdrawal'}
        </button>
      </form>
    </main>
  )
}
