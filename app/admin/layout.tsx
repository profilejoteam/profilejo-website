'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      // التحقق من صلاحيات الإدارة من جدول admins
      let adminCheck = null
      let error = null
      
      try {
        const { data, error: adminError } = await supabase
          .from('admins')
          .select('id, email, is_active')
          .eq('email', session.user.email)
          .eq('is_active', true)
          .single()
        
        adminCheck = data
        error = adminError
      } catch (tableError) {
        // إذا كان جدول admins غير موجود، تحقق من جدول profiles
        console.warn('جدول admins غير موجود، سيتم التحقق من جدول profiles')
        
        const { data: profileCheck, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, is_admin')
          .eq('email', session.user.email)
          .eq('is_admin', true)
          .single()
        
        if (!profileError && profileCheck) {
          adminCheck = profileCheck
          error = null
        } else {
          error = profileError
        }
      }

      if (error || !adminCheck) {
        console.error('Not an admin user:', session.user.email)
        console.error('Error details:', error)
        router.push('/')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح لك بالوصول</h1>
          <p className="text-gray-600 mb-6">ليس لديك صلاحيات إدارية للوصول إلى هذه الصفحة</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-purple-600 hover:text-purple-700">
                  بروفايل.جو
                </Link>
                <span className="mr-3 text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  إدارة
                </span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden sm:mr-6 sm:flex sm:space-x-reverse sm:space-x-8">
                <Link
                  href="/admin"
                  className="border-transparent text-gray-900 hover:text-purple-600 hover:border-purple-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                >
                  الرئيسية
                </Link>
                <Link
                  href="/admin/applications"
                  className="border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                >
                  الطلبات
                </Link>
                <Link
                  href="/admin/users"
                  className="border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                >
                  المستخدمين
                </Link>
                <Link
                  href="/admin/analytics"
                  className="border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                >
                  الإحصائيات
                </Link>
                <Link
                  href="/admin/admins"
                  className="border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                >
                  المدراء
                </Link>
                <Link
                  href="/admin/settings"
                  className="border-transparent text-gray-500 hover:text-purple-600 hover:border-purple-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                >
                  الإعدادات
                </Link>
              </div>
            </div>
            
            <div className="hidden sm:mr-6 sm:flex sm:items-center sm:space-x-reverse sm:space-x-4">
              <div className="text-sm text-gray-700">
                مرحباً، مدير
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                خروج
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {sidebarOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link
                href="/admin"
                className="bg-purple-50 border-purple-500 text-purple-700 block pr-3 py-2 border-r-4 text-base font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                الرئيسية
              </Link>
              <Link
                href="/admin/applications"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pr-3 py-2 border-r-4 text-base font-medium transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                الطلبات
              </Link>
              <Link
                href="/admin/users"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pr-3 py-2 border-r-4 text-base font-medium transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                المستخدمين
              </Link>
              <Link
                href="/admin/analytics"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pr-3 py-2 border-r-4 text-base font-medium transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                الإحصائيات
              </Link>
              <Link
                href="/admin/admins"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pr-3 py-2 border-r-4 text-base font-medium transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                المدراء
              </Link>
              <Link
                href="/admin/settings"
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pr-3 py-2 border-r-4 text-base font-medium transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                الإعدادات
              </Link>
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full text-right border-transparent text-red-600 hover:bg-red-50 hover:text-red-800 block pr-3 py-2 border-r-4 text-base font-medium transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}