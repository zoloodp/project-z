import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react'
import { FloatingCallButton } from '@/components/floating-call-button'
import { ServiceCard } from '@/components/service-card'
import { MotionSection } from '@/components/motion-section'
import { services } from '@/lib/constants'

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="section">
          <MotionSection className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm text-green-300">
                <CalendarDays className="h-4 w-4" />
                Зөвхөн Бямба, Ням гарагт захиалга авна
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
                PC Cleaning Service
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-300 sm:text-xl">
                Бид таны гэрт очиж үйлчилгээ үзүүлнэ. Тоосжилт, халалт, агаарын урсгалын асуудлыг мэргэжлийн түвшинд цэвэрлэж сайжруулна.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/booking" className="btn-primary">
                  Захиалга өгөх <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="#services" className="btn-secondary">
                  Үйлчилгээ үзэх
                </Link>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="glow-card p-4">
                  <div className="text-2xl font-bold text-cyan">On-Site</div>
                  <p className="mt-1 text-sm text-slate-300">Таны байршил дээр очиж үйлчилнэ</p>
                </div>
                <div className="glow-card p-4">
                  <div className="text-2xl font-bold text-cyan">5 слот</div>
                  <p className="mt-1 text-sm text-slate-300">Өдөрт хамгийн ихдээ 5 захиалга</p>
                </div>
                <div className="glow-card p-4">
                  <div className="text-2xl font-bold text-cyan">Weekend</div>
                  <p className="mt-1 text-sm text-slate-300">Зөвхөн амралтын өдөр</p>
                </div>
              </div>
            </div>

            <div className="glow-card relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan/20 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-500/20 blur-3xl" />
              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                  <Sparkles className="h-4 w-4" /> Өндөр хөрвөлттэй booking flow
                </div>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, title: 'Улаанбаатар хот дотор', text: 'Гэр, оффис, студи, ажлын байр дээр очиж үйлчилгээ үзүүлнэ.' },
                    { icon: ShieldCheck, title: 'Аюулгүй ажиллагаа', text: 'Тест хийж шалгаад буцаан угсарна.' },
                    { icon: PhoneCall, title: 'Хурдан холболт', text: 'Захиалгын дараа бид тантай утсаар холбогдоно.' }
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <item.icon className="mb-2 h-5 w-5 text-cyan" />
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-300">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MotionSection>
        </div>
      </section>

      <section id="services" className="py-12 sm:py-16">
        <div className="section">
          <MotionSection>
            <div className="mb-8 max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">Үйлчилгээний багцууд</h2>
              <p className="mt-3 text-slate-300">Энгийн хэрэглээнээс high-end gaming PC хүртэл тохирох 3 сонголт.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </MotionSection>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="section">
          <MotionSection className="glow-card grid gap-6 p-8 lg:grid-cols-3">
            <div>
              <h3 className="text-2xl font-bold">Яагаад манай үйлчилгээг сонгох вэ?</h3>
              <p className="mt-3 text-slate-300">Хялбар захиалга, weekend schedule, гэрээр очих үйлчилгээ.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <div className="text-lg font-semibold text-green-400">⚠️ Өдөрт зөвхөн 5 захиалга</div>
              <p className="mt-2 text-sm text-slate-300">Слот хурдан дүүрдэг тул эрт захиалаарай.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <div className="text-lg font-semibold text-cyan">🔥 STANDARD хамгийн түгээмэл</div>
              <p className="mt-2 text-sm text-slate-300">Gaming PC-д thermal paste болон airflow сайжруулалттай.</p>
            </div>
          </MotionSection>
        </div>
      </section>

      <FloatingCallButton />
    </main>
  )
}
