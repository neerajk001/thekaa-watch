import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ThekaWatch - Find Nearby Liquor Shops',
  description: 'Discover nearby liquor shops with real-time crowd levels and routes',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: '#0a0a0a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ThekaWatch',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}


