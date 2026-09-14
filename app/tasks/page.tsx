'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Task = {
  id: string
  title: string
  description: string
  rewardPoints: number
  estimatedMinutes?: number | null
  type: string
  provider: string
}

type Tab = 'SURVEY' | 'TASK' | 'OFFER'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('SURVEY')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Failed to load')
      else setTasks(data.tasks || [])
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Map every task to a visible tab
  const visible = tasks.filter((t) => {
    if (tab === 'SURVEY') return t.type === 'SURVEY' || t.provider === 'cpx-research'
    if (tab === 'TASK') return t.type === 'TASK' || t.type === 'VIDEO'
    if (tab === 'OFFER') return t.type === 'OFFER'
    return false
  })

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Earn</h1>
      <p className="text-sm text-gray-600">
        Pick an activity to start earning points.
      </p>

      {/* CPX Surveys shortcut card */}
      {tab === 'SURVEY' && (
        <Link
          href="/surveys"
          className="block bg-black text-white rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">📋 Complete Surveys</p>
              <p className="text-xs opacity-75">
                Powered by CPX Research · earn up to ₹50 per survey
              </p>
            </div>
            <span className="text-xl">→</span>
          </div>
        </Link>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['SURVEY', 'TASK', 'OFFER'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition ${
              tab === t
                ? 'border-black text-black'
                : 'border-transparent text-gray-500'
            }`}
          >
            {t === 'SURVEY' ? 'Surveys' : t === 'TASK' ? 'Tasks' : 'Offers'}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && visible.length === 0 && (
        <p className="text-gray-500 text-sm">
          No {tab.toLowerCase()}s available right now.
        </p>
      )}

      <div className="space-y-3">
        {visible.map((t) => (
          <Link
            key={t.id}
            href={`/tasks/${t.id}`}
            className="block border rounded-xl p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold pr-2">{t.title}</h3>
              <span className="text-green-600 font-semibold shrink-0">
                +{t.rewardPoints}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {t.description}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>
                {t.estimatedMinutes ? `${t.estimatedMinutes} min` : 'Quick'}
                {' · '}
                {t.provider}
              </span>
              <span className="text-black font-medium">Start →</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}