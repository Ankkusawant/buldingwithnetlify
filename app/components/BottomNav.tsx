'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/tasks', label: 'Earn', icon: '💰' },
  { href: '/wallet', label: 'Wallet', icon: '👛' },
  { href: '/referrals', label: 'Refer', icon: '🎁' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

const hiddenPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/admin',
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on auth pages and admin
  if (hiddenPaths.some((p) => pathname === p || pathname.startsWith('/admin'))) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white z-40 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 text-xs ${
                active ? 'text-black font-semibold' : 'text-gray-500'
              }`}
            >
              <span className="text-lg leading-none mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}