import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pegasus Audit Platform',
  description: 'Professional audit coordination platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-app-black">
      <body className="antialiased bg-app-black text-text-light font-inter">
        {children}
      </body>
    </html>
  )
}