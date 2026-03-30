import { createClient } from '@supabase/supabase-js'

let supabaseSingleton

export function getPublicSupabase() {
  if (!supabaseSingleton) {
    supabaseSingleton = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return supabaseSingleton
}

export function isWeekendDate(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function formatDateKey(date) {
  return date.toISOString().slice(0, 10)
}

export function getDateStatusMap(current, dateKey, time) {
  const existing = current[dateKey] ?? { count: 0, times: [] }
  return {
    ...current,
    [dateKey]: {
      count: existing.count + 1,
      times: Array.from(new Set([...existing.times, time]))
    }
  }
}

export function statusMeta(status) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-cyan/10 text-cyan border border-cyan/20' }
    case 'done':
      return { label: 'Done', className: 'bg-green-500/10 text-green-400 border border-green-500/20' }
    default:
      return { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' }
  }
}
