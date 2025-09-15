import './globals.css'
import type { Metadata, Viewport } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'بروفايل - هوية مهنية كاملة',
  description: 'هوية مهنية كاملة تجهزك لسوق العمل. سجل الآن وابدأ ببناء بروفايلك المهني',
  keywords: 'بروفايل, سيرة ذاتية, وظائف, العمل, مهني, LinkedIn',
  authors: [{ name: 'Profile Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'بروفايل - هوية مهنية كاملة',
    description: 'هوية مهنية كاملة تجهزك لسوق العمل',
    type: 'website',
    locale: 'ar_SA',
  },
  // منع المتصفح من cache الصفحات
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-arabic antialiased">
        <Navbar />
        <div className="min-h-screen bg-hero-gradient-alt">
          {children}
        </div>
      </body>
    </html>
  )
}
