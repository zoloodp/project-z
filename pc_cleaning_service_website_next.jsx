// Full-stack Next.js App Router project (simplified but production-ready structure)
// Tech: Next.js 14, Tailwind, Supabase, Framer Motion

// =============================
// 1. SUPABASE SETUP
// =============================
// Table: bookings
// columns:
// id (uuid, pk)
// name (text)
// phone (text)
// service (text)
// address (text)
// date (date)
// time (text)
// status (text, default 'pending')
// created_at (timestamp)

// =============================
// 2. LIB: supabase client
// =============================

// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =============================
// 3. UTIL: booking rules
// =============================

// lib/utils.ts
export const isWeekend = (date: Date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

export const TIME_SLOTS = [
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00'
]

export const MAX_PER_DAY = 5

// =============================
// 4. HOME PAGE
// =============================

// app/page.tsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center px-4">
      <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}}>
        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
          Зөвхөн Бямба, Ням гарагт захиалга авна
        </span>

        <h1 className="text-4xl font-bold mt-4">PC Cleaning Service</h1>
        <p className="text-gray-400 mt-2">Бид таны гэрт очиж үйлчилгээ үзүүлнэ</p>

        <Link href="/booking">
          <button className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl shadow-lg">
            Захиалга өгөх
          </button>
        </Link>
      </motion.div>
    </main>
  )
}

// =============================
// 5. SERVICES PAGE
// =============================

// app/services/page.tsx
export default function Services() {
  return (
    <div className="bg-[#0f172a] text-white min-h-screen p-6 grid gap-6 md:grid-cols-3">
      {services.map(s => (
        <div key={s.name} className="p-5 rounded-2xl bg-slate-900 shadow-xl border border-slate-700">
          <h2 className="text-xl font-bold">{s.name}</h2>
          <p className="text-green-400">{s.price}</p>
          <ul className="text-sm mt-2 space-y-1">
            {s.features.map(f => <li key={f}>• {f}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}

const services = [
  {
    name: 'BASIC CLEAN',
    price: '35,000₮',
    features: ['Тоос үлээлгэх','Case цэвэрлэх','Портууд цэвэрлэх']
  },
  {
    name: 'STANDARD CLEAN',
    price: '70,000₮',
    features: ['Thermal paste солих','Cable management']
  },
  {
    name: 'DEEP CLEAN',
    price: '120,000₮',
    features: ['GPU задлах','PSU цэвэрлэх']
  }
]

// =============================
// 6. BOOKING PAGE
// =============================

// app/booking/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { isWeekend, TIME_SLOTS } from '@/lib/utils'

export default function Booking() {
  const [form, setForm] = useState<any>({})
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const date = new Date(form.date)

    if (!isWeekend(date)) {
      return setError('Захиалга зөвхөн амралтын өдөр боломжтой')
    }

    const { data: existing } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', form.date)

    if (existing && existing.length >= 5) {
      return setError('Энэ өдөр дүүрсэн байна')
    }

    await supabase.from('bookings').insert([{ ...form }])

    alert('Таны захиалга бүртгэгдлээ. Бид холбогдох болно.')
  }

  return (
    <div className="bg-[#0f172a] text-white min-h-screen p-6">
      <h1 className="text-2xl mb-4">Захиалга</h1>

      <input placeholder="Нэр" onChange={e=>setForm({...form,name:e.target.value})} className="input" />
      <input placeholder="Утас" onChange={e=>setForm({...form,phone:e.target.value})} className="input" />
      <input placeholder="Хаяг" onChange={e=>setForm({...form,address:e.target.value})} className="input" />

      <input type="date" onChange={e=>setForm({...form,date:e.target.value})} className="input" />

      <select onChange={e=>setForm({...form,time:e.target.value})} className="input">
        {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
      </select>

      <select onChange={e=>setForm({...form,service:e.target.value})} className="input">
        <option>BASIC</option>
        <option>STANDARD</option>
        <option>DEEP</option>
      </select>

      {error && <p className="text-red-400">{error}</p>}

      <button onClick={handleSubmit} className="mt-4 bg-green-500 px-4 py-2 rounded">
        Илгээх
      </button>
    </div>
  )
}

// =============================
// 7. ADMIN DASHBOARD
// =============================

// app/admin/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin() {
  const [data,setData] = useState<any[]>([])

  const load = async () => {
    const { data } = await supabase.from('bookings').select('*')
    setData(data || [])
  }

  useEffect(()=>{ load() },[])

  const updateStatus = async (id:string,status:string)=>{
    await supabase.from('bookings').update({status}).eq('id',id)
    load()
  }

  return (
    <div className="p-6 text-white bg-[#0f172a] min-h-screen">
      <h1 className="text-2xl mb-4">Admin Dashboard</h1>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Name</th><th>Phone</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(b => (
            <tr key={b.id}>
              <td>{b.name}</td>
              <td>{b.phone}</td>
              <td>{b.service}</td>
              <td>{b.date}</td>
              <td>{b.time}</td>
              <td>{b.status}</td>
              <td>
                <button onClick={()=>updateStatus(b.id,'confirmed')}>✔</button>
                <button onClick={()=>updateStatus(b.id,'done')}>✓✓</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// =============================
// 8. STYLES
// =============================

// globals.css
.input {
  @apply block w-full p-2 my-2 bg-slate-800 border border-slate-600 rounded;
}

// =============================
// DONE
// =============================

// Features included:
// ✔ Weekend-only booking logic
// ✔ Max 5 bookings per day
// ✔ Supabase integration
// ✔ Admin dashboard
// ✔ Dark UI

// You can extend with:
// - Auth حماية
// - Toast UI
// - Calendar disable days
// - Revenue analytics
