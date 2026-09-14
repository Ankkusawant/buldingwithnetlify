'use client'
import { useEffect, useState } from 'react'

type Transaction = {
  id: string
  type: string
  points: number
  description: string | null
  createdAt: string
}

type WalletData = {
  pointsBalance: number
  pendingPoints: number
  cashValue: number
  pendingCash: number
  lifetimePoints: number
  lifetimeCash: number
  conversion: number
  transactions: Transaction[]
}

export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/wallet')
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) setError(d.error || 'Failed to load wallet')
        else setData(d)
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-6 text-gray-500">Loading wallet…</p>
  if (error) return <p className="p-6 text-red-600">{error}</p>
  if (!data) return <p className="p-6 text-gray-500">No data</p>

  const money = (v: number) => `₹${v.toFixed(2)}`

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="bg-black text-white rounded-2xl p-5">
        <p className="text-xs opacity-70 mb-1">Available</p>
        <p className="text-4xl font-bold">{money(data.cashValue)}</p>
        <p className="text-xs opacity-70 mt-1">
          {data.pointsBalance.toLocaleString()} points
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="border rounded-xl p-3">
          <p className="text-[10px] text-gray-500 uppercase">Pending</p>
          <p className="font-bold">{money(data.pendingCash)}</p>
        </div>
        <div className="border rounded-xl p-3">
          <p className="text-[10px] text-gray-500 uppercase">Lifetime</p>
          <p className="font-bold">{money(data.lifetimeCash)}</p>
        </div>
        <div className="border rounded-xl p-3">
          <p className="text-[10px] text-gray-500 uppercase">Rate</p>
          <p className="font-bold text-xs">
            {data.conversion}pts = ₹1
          </p>
        </div>
      </div>

      <h2 className="font-semibold pt-2">Transactions</h2>

      {data.transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.transactions.map((t) => (
            <li
              key={t.id}
              className="border rounded-lg p-3 flex justify-between items-center text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate">{t.description || t.type}</p>
                <p className="text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`ml-2 font-semibold ${
                  t.points >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {t.points >= 0 ? '+' : ''}
                {t.points}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}