'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'author' | 'reader'
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push(redirectTo)
      return
    }

    if (requiredRole) {
      const roleHierarchy = {
        'reader': 1,
        'author': 2,
        'admin': 3
      }

      const userLevel = roleHierarchy[(session as any).user.role as keyof typeof roleHierarchy] || 0
      const requiredLevel = roleHierarchy[requiredRole]

      if (userLevel < requiredLevel) {
        router.push('/dashboard')
        return
      }
    }
  }, [session, status, requiredRole, redirectTo, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRole) {
    const roleHierarchy = {
      'reader': 1,
      'author': 2,
      'admin': 3
    }

    const userLevel = roleHierarchy[(session as any).user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole]

    if (userLevel < requiredLevel) {
      return null
    }
  }

  return <>{children}</>
}