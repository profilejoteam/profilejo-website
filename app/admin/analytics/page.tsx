'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface AnalyticsData {
  totalUsers: number
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  dailyRegistrations: { date: string; count: number }[]
  monthlyRegistrations: { month: string; count: number }[]
  universityStats: { university: string; count: number }[]
  majorStats: { major: string; count: number }[]
  graduationYearStats: { year: string; count: number }[]
  approvalRate: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    dailyRegistrations: [],
    monthlyRegistrations: [],
    universityStats: [],
    majorStats: [],
    graduationYearStats: [],
    approvalRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // آخر 30 يوم افتراضياً

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // تحديد نطاق التاريخ
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - parseInt(dateRange))

      // جلب جميع البيانات
      const { data: allData, error } = await supabase
        .from('user_submissions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // حساب الإحصائيات الأساسية
      const totalApplications = allData?.length || 0
      const pendingApplications = allData?.filter(app => app.status === 'pending').length || 0
      const approvedApplications = allData?.filter(app => app.status === 'approved').length || 0
      const rejectedApplications = allData?.filter(app => app.status === 'rejected').length || 0
      const approvalRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0

      // إحصائيات التسجيل اليومية
      const dailyRegistrations: { [key: string]: number } = {}
      allData?.forEach(item => {
        const date = new Date(item.created_at).toISOString().split('T')[0]
        dailyRegistrations[date] = (dailyRegistrations[date] || 0) + 1
      })

      const dailyRegistrationsArray = Object.entries(dailyRegistrations).map(([date, count]) => ({
        date,
        count
      }))

      // إحصائيات التسجيل الشهرية
      const monthlyRegistrations: { [key: string]: number } = {}
      allData?.forEach(item => {
        const month = new Date(item.created_at).toISOString().substring(0, 7) // YYYY-MM
        monthlyRegistrations[month] = (monthlyRegistrations[month] || 0) + 1
      })

      const monthlyRegistrationsArray = Object.entries(monthlyRegistrations).map(([month, count]) => ({
        month,
        count
      }))

      // إحصائيات الجامعات
      const universityStats: { [key: string]: number } = {}
      allData?.forEach(item => {
        if (item.university) {
          universityStats[item.university] = (universityStats[item.university] || 0) + 1
        }
      })

      const universityStatsArray = Object.entries(universityStats)
        .map(([university, count]) => ({ university, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // أفضل 10 جامعات

      // إحصائيات التخصصات
      const majorStats: { [key: string]: number } = {}
      allData?.forEach(item => {
        if (item.major) {
          majorStats[item.major] = (majorStats[item.major] || 0) + 1
        }
      })

      const majorStatsArray = Object.entries(majorStats)
        .map(([major, count]) => ({ major, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // أفضل 10 تخصصات

      // إحصائيات سنوات التخرج
      const graduationYearStats: { [key: string]: number } = {}
      allData?.forEach(item => {
        if (item.graduation_year) {
          graduationYearStats[item.graduation_year] = (graduationYearStats[item.graduation_year] || 0) + 1
        }
      })

      const graduationYearStatsArray = Object.entries(graduationYearStats)
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => b.year.localeCompare(a.year))

      setAnalytics({
        totalUsers: totalApplications,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        approvalRate,
        dailyRegistrations: dailyRegistrationsArray,
        monthlyRegistrations: monthlyRegistrationsArray,
        universityStats: universityStatsArray,
        majorStats: majorStatsArray,
        graduationYearStats: graduationYearStatsArray,
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    const data = {
      summary: {
        'إجمالي الطلبات': analytics.totalApplications,
        'قيد المراجعة': analytics.pendingApplications,
        'مقبولة': analytics.approvedApplications,
        'مرفوضة': analytics.rejectedApplications,
        'معدل القبول': `${analytics.approvalRate.toFixed(2)}%`,
      },
      dailyRegistrations: analytics.dailyRegistrations,
      monthlyRegistrations: analytics.monthlyRegistrations,
      topUniversities: analytics.universityStats,
      topMajors: analytics.majorStats,
      graduationYears: analytics.graduationYearStats,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3 space-x-reverse">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600"
            >
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              الرئيسية
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="mr-1 text-sm font-medium text-gray-500 md:mr-2">التحليلات</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تحليلات وإحصائيات</h1>
          <p className="mt-1 text-sm text-gray-600">
            عرض شامل لأداء النظام والاتجاهات
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="7">آخر 7 أيام</option>
            <option value="30">آخر 30 يوماً</option>
            <option value="90">آخر 3 أشهر</option>
            <option value="365">آخر سنة</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <span className="ml-2">📥</span>
            تصدير البيانات
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    إجمالي الطلبات
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.totalApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    قيد المراجعة
                  </dt>
                  <dd className="text-lg font-medium text-yellow-600">
                    {analytics.pendingApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    مقبولة
                  </dt>
                  <dd className="text-lg font-medium text-green-600">
                    {analytics.approvedApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    مرفوضة
                  </dt>
                  <dd className="text-lg font-medium text-red-600">
                    {analytics.rejectedApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    معدل القبول
                  </dt>
                  <dd className="text-lg font-medium text-blue-600">
                    {analytics.approvalRate.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Registrations Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">التسجيلات اليومية</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.dailyRegistrations.length > 0 ? (
              analytics.dailyRegistrations.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString('ar-SA')}
                  </span>
                  <div className="flex items-center">
                    <div 
                      className="bg-blue-200 h-4 rounded mr-2"
                      style={{ 
                        width: `${(item.count / Math.max(...analytics.dailyRegistrations.map(d => d.count))) * 100}px` 
                      }}
                    ></div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد بيانات للفترة المحددة</p>
            )}
          </div>
        </div>

        {/* Monthly Registrations Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">التسجيلات الشهرية</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.monthlyRegistrations.length > 0 ? (
              analytics.monthlyRegistrations.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center">
                    <div 
                      className="bg-green-200 h-4 rounded mr-2"
                      style={{ 
                        width: `${(item.count / Math.max(...analytics.monthlyRegistrations.map(d => d.count))) * 100}px` 
                      }}
                    ></div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد بيانات للفترة المحددة</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Universities */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">أفضل الجامعات</h3>
          <div className="space-y-3">
            {analytics.universityStats.length > 0 ? (
              analytics.universityStats.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900 truncate">{item.university}</span>
                  <span className="text-sm font-medium text-blue-600">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد بيانات</p>
            )}
          </div>
        </div>

        {/* Top Majors */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">أفضل التخصصات</h3>
          <div className="space-y-3">
            {analytics.majorStats.length > 0 ? (
              analytics.majorStats.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900 truncate">{item.major}</span>
                  <span className="text-sm font-medium text-green-600">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد بيانات</p>
            )}
          </div>
        </div>

        {/* Graduation Years */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">سنوات التخرج</h3>
          <div className="space-y-3">
            {analytics.graduationYearStats.length > 0 ? (
              analytics.graduationYearStats.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{item.year}</span>
                  <span className="text-sm font-medium text-purple-600">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد بيانات</p>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">رؤى الأداء</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.totalApplications > 0 ? 
                (analytics.pendingApplications / analytics.totalApplications * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">طلبات قيد المراجعة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.approvalRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">معدل القبول</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.universityStats.length}
            </div>
            <div className="text-sm text-gray-600">جامعات مختلفة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.majorStats.length}
            </div>
            <div className="text-sm text-gray-600">تخصصات مختلفة</div>
          </div>
        </div>
      </div>
    </div>
  )
}