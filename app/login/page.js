'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { getPublicSupabase } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getPublicSupabase()

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/admin')
      }
    }
    check()
  }, [router, supabase])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Амжилттай нэвтэрлээ')
    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="section py-16">
      <div className="glow-card mx-auto max-w-md p-8">
        <h1 className="text-3xl font-bold">Admin Login</h1>
        <p className="mt-2 text-slate-300">Supabase email + password ашиглан нэвтэрнэ.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="btn-primary w-full disabled:opacity-70">
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>
      </div>
    </main>
  )
}
