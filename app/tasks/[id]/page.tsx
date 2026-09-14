'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Task = {
  id: string
  title: string
  description: string
  rewardPoints: number
  estimatedMinutes?: number | null
  type: string
  provider: string
  eligibility?: string | null
  requirements?: string | null
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/tasks')
      .then(async (r) => {
        const d = await r.json()
        const found = (d.tasks || []).find((t: Task) => t.id === id)
        if (found) setTask(found)
        else setError('Task not found')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [id])

  async function complete() {
    if (!task) return
    setCompleting(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to complete')
      } else {
        setMessage(`+${data.points || task.rewardPoints} points credited!`)
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    } catch {
      setError('Network error')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading…</p>
  if (!task)
    return (
      <main className="p-6 text-center space-y-3">
        <p className="text-red-600">Task not found</p>
        <Link href="/tasks" className="text-blue-600 underline text-sm">
          Back to Earn
        </Link>
      </main>
    )

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Back
      </button>

      <div className="border rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-start">
          <h1 className="text-xl font-bold pr-3">{task.title}</h1>
          <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-lg shrink-0">
            +{task.rewardPoints}
          </span>
        </div>

        <p className="text-gray-600 text-sm">{task.description}</p>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="border rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase">Reward</p>
            <p className="font-bold text-sm">{task.rewardPoints} pts</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase">Time</p>
            <p className="font-bold text-sm">
              {task.estimatedMinutes ? `${task.estimatedMinutes} min` : 'Quick'}
            </p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase">Type</p>
            <p className="font-bold text-sm capitalize">
              {task.type.toLowerCase()}
            </p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase">Provider</p>
            <p className="font-bold text-sm">{task.provider}</p>
          </div>
        </div>

        {task.eligibility && (
          <div>
            <p className="text-xs font-semibold text-gray-700">Eligibility</p>
            <p className="text-sm text-gray-600">{task.eligibility}</p>
          </div>
        )}

        {task.requirements && (
          <div>
            <p className="text-xs font-semibold text-gray-700">Requirements</p>
            <p className="text-sm text-gray-600">{task.requirements}</p>
          </div>
        )}
      </div>

      {message && (
        <p className="text-sm text-green-600 font-medium text-center">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 font-medium text-center">{error}</p>
      )}

      <button
        onClick={complete}
        disabled={completing}
        className="w-full bg-black text-white py-4 rounded-xl font-semibold disabled:opacity-50"
      >
        {completing ? 'Completing…' : 'Start task'}
      </button>
    </main>
  )
}