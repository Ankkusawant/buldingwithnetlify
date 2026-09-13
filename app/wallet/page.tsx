'use client'
import { useEffect, useState } from 'react'

export default function WalletPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wallet').then((r) => r.json()).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="p-6">Loading wallet…</p>
  if (!data) return <p className="p-6">Unable to load wallet.</p>

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Wallet</h1>

      <div className="border rounded-xl p-5">
        <p className="text-xs text-gray-500">Available balance</p>
        <p className="text-3xl font-bold">₹{data.cashValue?.toFixed(2) ?? '0.00'}</p>
        <p className="text-sm text-gray-500 mt-1">{data.pointsBalance} points</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded-xl p-3">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="font-bold">{data.pendingPoints} pts</p>
        </div>
        <div className="border rounded-xl p-3">
          <p className="text-xs text-gray-500">Conversion</p>
          <p className="font-bold">100 pts = ₹1</p>
        </div>
      </div>

      <h2 className="font-semibold pt-4">Transactions</h2>
      {data.transactions?.length === 0 && (
        <p className="text-sm text-gray-500">No transactions yet.</p>
      )}
      <ul className="space-y-2">
        {data.transactions?.map((t: any) => (
          <li key={t.id} className="border rounded-lg p-3 flex justify-between text-sm">
            <div>
              <p className="font-medium">{t.description || t.type}</p>
              <p className="text-xs text-gray-400">
                {new Date(t.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={t.points >= 0 ? 'text-green-600' : 'text-red-600'}>
              {t.points >= 0 ? '+' : ''}
              {t.points}
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}
