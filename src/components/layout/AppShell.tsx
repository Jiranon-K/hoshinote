"use client"

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface AppShellProps {
  children: ReactNode
}

// Conditionally renders global Header and Footer except on auth pages (/auth/*)
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const hideChrome = pathname.startsWith('/auth/')

  return (
    <>
      {!hideChrome && <Header />}
      <main className="flex-1">{children}</main>
      {!hideChrome && <Footer />}
    </>
  )
}
