# PC Cleaning Service Website

Next.js + Tailwind CSS + Supabase + Vercel booking website for an on-site PC cleaning business.

## Features

- Mongolian landing page with dark neon UI
- Detailed service cards
- Booking form with:
  - weekend-only booking
  - max 5 bookings per day
  - disabled fully booked days
  - fixed time slots
  - slots-left counter
- Floating call button
- Admin login with Supabase auth
- Admin dashboard:
  - bookings table
  - filter by date and status
  - confirm / done / delete actions
  - daily summary and revenue estimate
- SEO metadata for:
  - PC cleaning Ulaanbaatar
  - Компьютер цэвэрлэгээ гэрээр

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BUSINESS_PHONE=99112233
```

## Supabase setup

1. Create a new Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. In Authentication, create an admin user using email + password.
5. Copy your project URL and anon key into `.env.local` and Vercel env vars.

## Vercel deploy settings

- Framework Preset: **Next.js**
- Root Directory: `./`
- Build Command: leave default
- Output Directory: leave default
- Install Command: leave default

## GitHub upload

Upload the full project folder contents, not a single `.jsx` file.

Required structure:

```text
app/
components/
lib/
supabase/
package.json
next.config.mjs
postcss.config.mjs
tailwind.config.js
jsconfig.json
.env.example
README.md
```

## Important note

This starter keeps booking availability simple by allowing public read access to the `bookings` table. For stronger privacy, replace public select access with a restricted availability view or a server-side endpoint backed by a service role key.
