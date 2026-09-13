'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }
  return (
    <button onClick={logout} className="text-sm text-gray-600 hover:text-black">
      Logout
    </button>
  )
}
