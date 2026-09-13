import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSetting } from '@/lib/settings'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

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
    <main className="p-4 max-w-md mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ZOVIRA</h1>
        <LogoutButton />
      </div>

      <p className="text-gray-600">Welcome, {user.name || user.email}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded-xl p-4">
          <p className="text-xs text-gray-500">Available</p>
          <p className="text-xl font-bold">
            ₹{(user.pointsBalance / conversion).toFixed(2)}
          </p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold">
            ₹{(user.pendingPoints / conversion).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/tasks" className="border rounded-xl p-5 text-center hover:bg-gray-50">
          <p className="font-medium">Earn</p>
          <p className="text-xs text-gray-500">Surveys & offers</p>
        </Link>
        <Link href="/wallet" className="border rounded-xl p-5 text-center hover:bg-gray-50">
          <p className="font-medium">Wallet</p>
          <p className="text-xs text-gray-500">Transactions</p>
        </Link>
        <Link href="/referrals" className="border rounded-xl p-5 text-center hover:bg-gray-50">
          <p className="font-medium">Refer</p>
          <p className="text-xs text-gray-500">Invite friends</p>
        </Link>
        <Link href="/withdraw" className="border rounded-xl p-5 text-center hover:bg-gray-50">
          <p className="font-medium">Withdraw</p>
          <p className="text-xs text-gray-500">Cash out</p>
        </Link>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Recent transactions</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((t) => (
              <li key={t.id} className="border rounded-lg p-3 flex justify-between text-sm">
                <span>{t.description || t.type}</span>
                <span className={t.points >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {t.points >= 0 ? '+' : ''}
                  {t.points} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
