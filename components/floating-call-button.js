'use client'

import { Phone } from 'lucide-react'

export function FloatingCallButton() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '99112233'

  return (
    <a
      href={`tel:${phone}`}
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-slate-950 shadow-glow transition hover:scale-105"
      aria-label="Call now"
    >
      <Phone className="h-6 w-6" />
    </a>
  )
}
