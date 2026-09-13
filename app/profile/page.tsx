import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="border rounded-xl divide-y">
        <Row label="Name" value={user.name || '—'} />
        <Row label="Email" value={user.email} />
        <Row label="Phone" value={user.phone || '—'} />
        <Row label="Referral code" value={user.referralCode} />
        <Row label="Account status" value={user.status} />
        <Row label="Role" value={user.role} />
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between p-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
