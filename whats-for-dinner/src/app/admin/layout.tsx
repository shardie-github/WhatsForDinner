'use client'

import { useUser } from '@supabase/auth-helpers-react'
import { useTenant } from '@/hooks/useTenant'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  BarChart3, 
  Users, 
  Settings, 
  CreditCard, 
  Activity,
  Home,
  Shield
} from 'lucide-react'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/analytics', label: 'Analytics', icon: Activity },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: userLoading } = useUser()
  const { tenant, loading: tenantLoading } = useTenant()
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth')
      return
    }

    if (!tenantLoading && tenant && tenant.plan === 'free') {
      router.push('/billing')
      return
    }

    if (!tenantLoading && tenant && tenant.status !== 'active') {
      router.push('/billing')
      return
    }
  }, [user, userLoading, tenant, tenantLoading, router])

  if (userLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!tenant || tenant.plan === 'free' || tenant.status !== 'active') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  Admin Dashboard
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {tenant.name} ({tenant.plan})
              </span>
              <Link
                href="/"
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <Home className="h-4 w-4" />
                <span>Back to App</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}