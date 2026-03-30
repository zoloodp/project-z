import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ dates: {} })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const today = new Date().toISOString().slice(0, 10)
  const future = new Date()
  future.setMonth(future.getMonth() + 3)

  const { data, error } = await supabase
    .from('bookings')
    .select('date, time')
    .gte('date', today)
    .lte('date', future.toISOString().slice(0, 10))

  if (error) {
    return NextResponse.json({ dates: {}, error: error.message }, { status: 500 })
  }

  const dates = {}
  for (const booking of data ?? []) {
    const key = booking.date
    if (!dates[key]) {
      dates[key] = { count: 0, times: [] }
    }
    dates[key].count += 1
    dates[key].times.push(booking.time)
  }

  return NextResponse.json({ dates })
}
