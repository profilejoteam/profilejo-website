import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'بروفايل - هوية مهنية كاملة',
  description: 'هوية مهنية كاملة تجهزك لسوق العمل. سجل الآن وابدأ ببناء بروفايلك المهني',
  keywords: 'بروفايل, سيرة ذاتية, وظائف, العمل, مهني, LinkedIn',
  authors: [{ name: 'Profile Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'بروفايل - هوية مهنية كاملة',
    description: 'هوية مهنية كاملة تجهزك لسوق العمل',
    type: 'website',
    locale: 'ar_SA',
  },
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
        <div className="min-h-screen bg-hero-gradient-alt">
          {children}
        </div>
      </body>
    </html>
  )
}
