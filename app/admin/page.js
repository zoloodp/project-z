'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, Trash2 } from 'lucide-react'
import { getPublicSupabase, statusMeta } from '@/lib/utils'
import { servicePriceMap, statusOptions } from '@/lib/constants'

export default function AdminPage() {
  const [sessionChecked, setSessionChecked] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [bookings, setBookings] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = getPublicSupabase()

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()
      setIsAuthed(Boolean(data.session))
      setSessionChecked(true)
      if (data.session) {
        await loadBookings()
      } else {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  async function loadBookings() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      toast.error('Захиалгуудыг уншиж чадсангүй')
    } else {
      setBookings(data ?? [])
    }
    setLoading(false)
  }

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatch = statusFilter === 'all' || booking.status === statusFilter
      const dateMatch = !dateFilter || booking.date === dateFilter
      return statusMatch && dateMatch
    })
  }, [bookings, statusFilter, dateFilter])

  const today = new Date().toISOString().slice(0, 10)
  const todayBookings = bookings.filter((booking) => booking.date === today)
  const revenueEstimate = todayBookings.reduce((sum, booking) => sum + (servicePriceMap[booking.service] ?? 0), 0)

  async function updateStatus(id, status) {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (error) {
      toast.error('Төлөв шинэчлэхэд алдаа гарлаа')
      return
    }
    toast.success('Төлөв шинэчлэгдлээ')
    loadBookings()
  }

  async function deleteBooking(id) {
    const ok = window.confirm('Энэ захиалгыг устгах уу?')
    if (!ok) return

    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) {
      toast.error('Устгах үед алдаа гарлаа')
      return
    }
    toast.success('Захиалга устлаа')
    loadBookings()
  }

  async function logout() {
    await supabase.auth.signOut()
    setIsAuthed(false)
  }

  if (!sessionChecked) {
    return <div className="section py-16 text-slate-300">Loading...</div>
  }

  if (!isAuthed) {
    return (
      <main className="section py-16">
        <div className="glow-card mx-auto max-w-lg p-8 text-center">
          <h1 className="text-2xl font-bold">Admin dashboard protected</h1>
          <p className="mt-3 text-slate-300">Эхлээд admin нэвтрэх шаардлагатай.</p>
          <a href="/login" className="btn-primary mt-6">Нэвтрэх</a>
        </div>
      </main>
    )
  }

  return (
    <main className="section py-10 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-300">Захиалга хянах, төлөв өөрчлөх, устгах.</p>
        </div>
        <button onClick={logout} className="btn-secondary">Гарах</button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="glow-card p-5">
          <div className="text-sm text-slate-300">Өнөөдрийн нийт захиалга</div>
          <div className="mt-2 text-4xl font-black text-cyan">{todayBookings.length}</div>
        </div>
        <div className="glow-card p-5">
          <div className="text-sm text-slate-300">Орлогын таамаг</div>
          <div className="mt-2 text-4xl font-black text-green-400">{revenueEstimate.toLocaleString()}₮</div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Өдрөөр шүүх</label>
          <input type="date" className="input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <div>
          <label className="label">Төлвөөр шүүх</label>
          <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Бүгд</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrap">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-white/10 bg-slate-950/40">
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Service</th>
                <th>Address</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Захиалга алга</td>
                </tr>
              ) : (
                filtered.map((booking) => {
                  const meta = statusMeta(booking.status)
                  return (
                    <tr key={booking.id} className="border-t border-white/5">
                      <td>{booking.name}</td>
                      <td>{booking.phone}</td>
                      <td className="uppercase">{booking.service}</td>
                      <td className="min-w-[220px]">{booking.address}</td>
                      <td>{booking.date}</td>
                      <td>{booking.time}</td>
                      <td>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateStatus(booking.id, 'confirmed')} className="rounded-xl border border-cyan/30 px-3 py-2 text-xs text-cyan">Confirm</button>
                          <button onClick={() => updateStatus(booking.id, 'done')} className="rounded-xl border border-green-400/30 px-3 py-2 text-xs text-green-400">Done</button>
                          <button onClick={() => deleteBooking(booking.id)} className="rounded-xl border border-red-400/30 px-3 py-2 text-xs text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
