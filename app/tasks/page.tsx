'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Task = {
  id: string
  title: string
  description: string
  rewardPoints: number
  estimatedMinutes?: number
  type: string
  provider: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) {
        setError('Failed to load tasks')
        setLoading(false)
        return
      }
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function complete(task: Task) {
    setCompleting(task.id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to complete task')
      } else {
        setSuccess(`+${data.points || task.rewardPoints} points!`)
        await load()
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch {
      setError('Network error')
    } finally {
      setCompleting(null)
    }
  }

  if (loading) return <p className="p-6">Loading tasks…</p>

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Earn</h1>
      <p className="text-sm text-gray-600">Complete tasks to earn points.</p>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm font-semibold">{success}</p>
      )}

      <Link
        href="/surveys"
        className="block border rounded-xl p-5 bg-black text-white hover:bg-gray-800"
      >
        <p className="font-semibold text-lg">📋 Surveys</p>
        <p className="text-sm opacity-80">Earn points from CPX Research</p>
      </Link>

      {tasks.length === 0 && !error && (
        <p className="text-gray-500">No tasks available yet.</p>
      )}

      <div className="space-y-3">
        {tasks.map((t) => (
          <div key={t.id} className="border rounded-xl p-4">
            <div className="flex justify-between mb-1">
              <h3 className="font-semibold">{t.title}</h3>
              <span className="text-green-600 font-semibold">
                +{t.rewardPoints}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{t.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {t.estimatedMinutes ? `${t.estimatedMinutes} min · ` : ''}
                {t.type}
              </span>
              <button
                onClick={() => complete(t)}
                disabled={completing === t.id}
                className="bg-black text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {completing === t.id ? 'Completing…' : 'Start'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}