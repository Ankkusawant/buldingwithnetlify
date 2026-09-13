'use client'
import { useEffect, useState } from 'react'

export default function ReferralsPage() {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/wallet').then((r) => r.json()).then(() => {
      // pull the user from a separate call
      fetch('/api/auth/me').then((r) => r.json()).then((d) => {
        if (d?.user?.referralCode) setCode(d.user.referralCode)
      })
    })
  }, [])

  const link = code ? `https://zovira.netlify.app/register?ref=${code}` : ''

  function copy() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Refer & Earn</h1>
      <p className="text-sm text-gray-600">
        Invite friends. Earn bonus points when they complete their first task.
      </p>

      {code ? (
        <>
          <div className="border rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Your referral code</p>
            <p className="text-xl font-mono font-bold">{code}</p>
          </div>

          <div className="border rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Your invite link</p>
            <p className="text-sm break-all mb-3">{link}</p>
            <button
              onClick={copy}
              className="w-full bg-black text-white py-2 rounded-lg text-sm"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">Loading…</p>
      )}
    </main>
  )
}
