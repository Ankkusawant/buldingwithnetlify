import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getCurrentUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight mb-4">ZOVIRA</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Earn real rewards for surveys, offers, tasks and referrals.
      </p>
      <div className="flex gap-3">
        <Link
          href="/register"
          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
        >
          Login
        </Link>
      </div>
      <p className="text-xs text-gray-400 mt-12">
        © {new Date().getFullYear()} Zovira. All rights reserved.
      </p>
    </main>
  )
}
