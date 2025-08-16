import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardSidebar from '@/components/layout/DashboardSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}