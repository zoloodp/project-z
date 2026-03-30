import Link from 'next/link'

export function ServiceCard({ service }) {
  return (
    <div className={`glow-card relative flex h-full flex-col p-6 ${service.popular ? 'ring-1 ring-cyan/40' : ''}`}>
      {service.badge ? (
        <div className="mb-4 inline-flex w-fit rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
          {service.badge}
        </div>
      ) : null}
      <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">{service.name}</div>
      <div className="mt-3 text-4xl font-black text-white">{service.priceLabel}</div>
      <div className="mt-4 text-sm text-slate-300">{service.duration}</div>
      <div className="mt-1 text-sm text-slate-400">{service.audience}</div>
      <ul className="mt-6 space-y-3 text-sm text-slate-200">
        {service.features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-cyan" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/booking" className="btn-primary mt-8 w-full">Энэ багцыг сонгох</Link>
    </div>
  )
}
