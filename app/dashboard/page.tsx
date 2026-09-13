import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const conversion = parseFloat(await getSetting('points_conversion', '100'))

  const recent = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">ZOVIRA</h1>
      <p>Welcome, {user.name || user.email}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded p-3">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-xl font-bold">
            ₹{(user.pointsBalance / conversion).toFixed(2)}
          </p>
        </div>
        <div className="border rounded p-3">
          <p className="text-sm text-gray-500">Pending Rewards</p>
          <p className="text-xl font-bold">
            ₹{(user.pendingPoints / conversion).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/tasks" className="border rounded p-4 text-center">Earn</Link>
        <Link href="/wallet" className="border rounded p-4 text-center">Wallet</Link>
        <Link href="/referrals" className="border rounded p-4 text-center">Refer & Earn</Link>
        <Link href="/withdraw" className="border rounded p-4 text-center">Withdraw</Link>
      </div>

      <h2 className="font-semibold">Recent Transactions</h2>
      <ul className="space-y-2">
        {recent.map((t) => (
          <li key={t.id} className="border rounded p-2 flex justify-between">
            <span>{t.description || t.type}</span>
            <span className={t.points >= 0 ? 'text-green-600' : 'text-red-600'}>
              {t.points >= 0 ? '+' : ''}{t.points} pts
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}