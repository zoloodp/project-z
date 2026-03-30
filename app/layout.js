import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  metadataBase: new URL('https://example.vercel.app'),
  title: {
    default: 'PC Cleaning Service | Компьютер цэвэрлэгээ гэрээр',
    template: '%s | PC Cleaning Service'
  },
  description: 'PC cleaning Ulaanbaatar — Компьютер цэвэрлэгээ гэрээр. Зөвхөн Бямба, Ням гарагт захиалга авна.',
  keywords: ['PC cleaning Ulaanbaatar', 'Компьютер цэвэрлэгээ гэрээр', 'PC cleaning service', 'Улаанбаатар компьютер цэвэрлэгээ'],
  openGraph: {
    title: 'PC Cleaning Service',
    description: 'Бид таны гэрт очиж үйлчилгээ үзүүлнэ',
    locale: 'mn_MN',
    type: 'website'
  },
  alternates: {
    canonical: '/'
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="mn">
      <body className="bg-background text-white antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#fff',
              border: '1px solid rgba(56,189,248,0.25)'
            }
          }}
        />
      </body>
    </html>
  )
}
