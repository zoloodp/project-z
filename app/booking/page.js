'use client'

import { useEffect, useMemo, useState } from 'react'
import { addMonths, format } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import toast from 'react-hot-toast'
import { Loader2, MapPinHouse } from 'lucide-react'
import { FloatingCallButton } from '@/components/floating-call-button'
import { MotionSection } from '@/components/motion-section'
import { services, TIME_SLOTS, MAX_BOOKINGS_PER_DAY, servicePriceMap } from '@/lib/constants'
import { formatDateKey, getDateStatusMap, getPublicSupabase, isWeekendDate } from '@/lib/utils'

const initialForm = {
  name: '',
  phone: '',
  service: 'standard',
  address: '',
  date: null,
  time: '10:00'
}

export default function BookingPage() {
  const [form, setForm] = useState(initialForm)
  const [busyDates, setBusyDates] = useState({})
  const [loadingDates, setLoadingDates] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadAvailability() {
      try {
        setLoadingDates(true)
        const response = await fetch('/api/availability')
        const payload = await response.json()
        setBusyDates(payload?.dates ?? {})
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingDates(false)
      }
    }

    loadAvailability()
  }, [])

  const selectedDateKey = form.date ? formatDateKey(form.date) : null
  const selectedDateInfo = selectedDateKey ? busyDates[selectedDateKey] : null
  const slotsLeft = selectedDateInfo ? MAX_BOOKINGS_PER_DAY - selectedDateInfo.count : MAX_BOOKINGS_PER_DAY

  const disabledDays = useMemo(() => {
    return (date) => {
      const key = formatDateKey(date)
      const dayInfo = busyDates[key]
      return !isWeekendDate(date) || (dayInfo && dayInfo.count >= MAX_BOOKINGS_PER_DAY)
    }
  }, [busyDates])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.date || !isWeekendDate(form.date)) {
      toast.error('Захиалга зөвхөн амралтын өдөр боломжтой')
      return
    }

    if (slotsLeft <= 0) {
      toast.error('Сонгосон өдөр бүрэн дүүрсэн байна')
      return
    }

    try {
      setSubmitting(true)
      const supabase = getPublicSupabase()
      const dateKey = formatDateKey(form.date)

      const { data: sameSlot, error: slotError } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .eq('date', dateKey)
        .eq('time', form.time)
        .maybeSingle()

      if (slotError && slotError.code !== 'PGRST116') {
        throw slotError
      }

      if (sameSlot?.id) {
        toast.error('Энэ цагийн слот аль хэдийн захиалагдсан байна')
        return
      }

      const { data: dayBookings, error: countError } = await supabase
        .from('bookings')
        .select('id')
        .eq('date', dateKey)

      if (countError) {
        throw countError
      }

      if ((dayBookings?.length ?? 0) >= MAX_BOOKINGS_PER_DAY) {
        toast.error('Энэ өдөр дүүрсэн байна')
        return
      }

      const { error } = await supabase.from('bookings').insert({
        name: form.name,
        phone: form.phone,
        service: form.service,
        address: form.address,
        date: dateKey,
        time: form.time,
        status: 'pending'
      })

      if (error) {
        throw error
      }

      toast.success('Таны захиалга бүртгэгдлээ. Бид холбогдох болно.')
      setBusyDates((prev) => getDateStatusMap(prev, dateKey, form.time))
      setForm(initialForm)
    } catch (error) {
      console.error(error)
      toast.error('Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="py-10 sm:py-16">
      <div className="section grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <MotionSection className="space-y-6">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm text-cyan">
              Weekend only booking
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Захиалга өгөх</h1>
            <p className="mt-3 text-slate-300">Хаяг болон багцаа сонгоод weekend слот захиална.</p>
          </div>

          <div className="glow-card p-5">
            <div className="flex items-center gap-3 text-green-400">
              <MapPinHouse className="h-5 w-5" />
              <span className="font-semibold">On-site үйлчилгээ</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">Бид таны байршил дээр очиж PC-г цэвэрлэнэ. Хаяг заавал шаардлагатай.</p>
          </div>

          <div className="glow-card p-5">
            <div className="text-sm text-slate-300">Сонгосон өдрийн үлдсэн слот</div>
            <div className="mt-2 text-3xl font-black text-cyan">{selectedDateKey ? slotsLeft : MAX_BOOKINGS_PER_DAY}</div>
            <div className="mt-2 text-sm text-slate-300">
              {selectedDateKey ? `${format(form.date, 'yyyy-MM-dd')} өдөр` : 'Өдөр сонгоно уу'}
            </div>
          </div>

          <div className="glow-card p-5">
            <h2 className="text-lg font-semibold">Үнэний мэдээлэл</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-none last:pb-0">
                  <span>{service.name}</span>
                  <span className="font-semibold text-white">{servicePriceMap[service.id].toLocaleString()}₮</span>
                </div>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection className="glow-card p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label">Нэр</label>
                <input
                  className="input"
                  placeholder="Жишээ: Бат"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label">Утас</label>
                <input
                  className="input"
                  placeholder="Жишээ: 99112233"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Үйлчилгээний төрөл</label>
              <select
                className="select"
                value={form.service}
                onChange={(e) => setForm((prev) => ({ ...prev, service: e.target.value }))}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} — {service.priceLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Хаяг</label>
              <input
                className="input"
                placeholder="Дүүрэг, хороо, байр, тоот"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
              <div>
                <label className="label">Өдөр сонгох</label>
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  {loadingDates ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-5 w-32 rounded bg-white/10" />
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, index) => (
                          <div key={index} className="h-10 rounded-xl bg-white/10" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <DayPicker
                      mode="single"
                      selected={form.date}
                      onSelect={(date) => setForm((prev) => ({ ...prev, date: date ?? null }))}
                      disabled={disabledDays}
                      fromDate={new Date()}
                      toDate={addMonths(new Date(), 3)}
                    />
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-400">Захиалга зөвхөн амралтын өдөр боломжтой.</p>
              </div>

              <div>
                <label className="label">Цагийн слот</label>
                <div className="grid gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const taken = selectedDateInfo?.times?.includes(slot)
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!selectedDateKey || taken}
                        onClick={() => setForm((prev) => ({ ...prev, time: slot }))}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                          form.time === slot
                            ? 'border-cyan bg-cyan text-slate-950'
                            : taken
                              ? 'cursor-not-allowed border-white/5 bg-white/5 text-slate-500'
                              : 'border-white/10 bg-slate-950/50 text-white hover:border-cyan/40'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <button disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Захиалга илгээх'}
            </button>
          </form>
        </MotionSection>
      </div>
      <FloatingCallButton />
    </main>
  )
}
