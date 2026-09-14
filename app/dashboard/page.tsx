import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const conversion = parseFloat(await getSetting('points_conversion', '100'))

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [todayAgg, lifetimeAgg, recent] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        points: { gt: 0 },
        status: 'COMPLETED',
        createdAt: { gte: startOfToday },
      },
      _sum: { points: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        points: { gt: 0 },
        status: 'COMPLETED',
      },
      _sum: { points: true },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const todayPoints = todayAgg._sum.points || 0
  const lifetimePoints = lifetimeAgg._sum.points || 0

  const money = (pts: number) => `₹${(pts / conversion).toFixed(2)}`

  return (
    <main className="p-4 max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ZOVIRA</h1>
        <LogoutButton />
      </div>

      <p className="text-gray-600">
        Welcome, {user.name || user.email.split('@')[0]}
      </p>

      {/* Primary balance card */}
      <div className="bg-black text-white rounded-2xl p-5">
        <p className="text-xs opacity-70 mb-1">Available Balance</p>
        <p className="text-4xl font-bold">{money(user.pointsBalance)}</p>
        <p className="text-xs opacity-70 mt-1">
          {user.pointsBalance.toLocaleString()} points
        </p>
      </div>

      {/* 3 stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="border rounded-xl p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
            Pending
          </p>
          <p className="text-lg font-bold">{money(user.pendingPoints)}</p>
        </div>
        <div className="border rounded-xl p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
            Today
          </p>
          <p className="text-lg font-bold text-green-600">
            {money(todayPoints)}
          </p>
        </div>
        <div className="border rounded-xl p-3">
          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
            Lifetime
          </p>
          <p className="text-lg font-bold">{money(lifetimePoints)}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/tasks"
          className="bg-black text-white rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="text-lg">💰</span>
          <span className="font-semibold text-sm">Earn more</span>
          <span className="text-xs opacity-70">Surveys & tasks</span>
        </Link>
        <Link
          href="/wallet"
          className="border rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="text-lg">👛</span>
          <span className="font-semibold text-sm">Wallet</span>
          <span className="text-xs text-gray-500">Transactions</span>
        </Link>
        <Link
          href="/referrals"
          className="border rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="text-lg">🎁</span>
          <span className="font-semibold text-sm">Refer</span>
          <span className="text-xs text-gray-500">Invite friends</span>
        </Link>
        <Link
          href="/withdraw"
          className="border rounded-xl p-4 flex flex-col gap-1"
        >
          <span className="text-lg">🏦</span>
          <span className="font-semibold text-sm">Withdraw</span>
          <span className="text-xs text-gray-500">Cash out</span>
        </Link>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Recent activity</h2>
          <Link href="/wallet" className="text-xs text-blue-600">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">
            No activity yet — complete a task to start earning.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((t) => (
              <li
                key={t.id}
                className="border rounded-lg p-3 flex justify-between items-center text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{t.description || t.type}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString()}
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
      </div>
    </main>
  )
}