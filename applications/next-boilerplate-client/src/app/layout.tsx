import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ApolloWrapper from '../lib/ApolloWrapper'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eversports frontend assignment',
  description: 'Looking forward to see what you come up with!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  )
}
