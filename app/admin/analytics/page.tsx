'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  Clock, 
  DollarSign, 
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Briefcase,
  Star,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import KPICard from '@/components/KPICard'
import { 
  AreaChartComponent, 
  PieChartComponent, 
  BarChartComponent, 
  LineChartComponent 
} from '@/components/ChartComponents'

interface AnalyticsData {
  summary: {
    totalUsers: number
    newUsersInPeriod: number
    completedPayments: number
    pendingPayments: number
    totalRevenue: number
    conversionRate: number
  }
  statusDistribution: { [key: string]: number }
  cityStats: { city: string; count: number }[]
  planStats: { [key: string]: { count: number; revenue: number } }
  dailyRegistrations: { date: string; count: number; formattedDate: string }[]
  topSkills: { skill: string; count: number }[]
  jobTypeStats: { [key: string]: number }
  period: {
    startDate: string
    endDate: string
    days: number
  }
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching analytics data for days:', dateRange)
      
      const response = await fetch(`/api/analytics?days=${dateRange}`)
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Analytics data received:', data)
      
      if (data.error) {
        console.error('❌ API returned error:', data.error)
        throw new Error(data.error)
      }
      
      console.log('✅ Data summary:', data.summary)
      console.log(`   - Total Users: ${data.summary.totalUsers}`)
      console.log(`   - Cities found: ${data.cityStats.length}`)
      console.log(`   - Skills found: ${data.topSkills.length}`)
      console.log(`   - Daily registrations: ${data.dailyRegistrations.length}`)
      
      setAnalytics(data)
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
      
      // في حالة الخطأ، استخدم بيانات وهمية للعرض مع تنبيه للمطور
      console.warn('⚠️ Using fallback demo data due to API error')
      
      const fallbackData: AnalyticsData = {
        summary: {
          totalUsers: 0,
          newUsersInPeriod: 0,
          completedPayments: 0,
          pendingPayments: 0,
          totalRevenue: 0,
          conversionRate: 0
        },
        statusDistribution: {},
        cityStats: [],
        planStats: {},
        dailyRegistrations: [],
        topSkills: [],
        jobTypeStats: {},
        period: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          days: 30
        }
      }
      
      setAnalytics(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">جاري تحميل البيانات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm sm:text-base">فشل في تحميل البيانات</p>
            <button 
              onClick={fetchAnalytics}
              className="mt-4 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  // تحويل البيانات للرسوم البيانية
  const statusChartData = Object.entries(analytics.statusDistribution).map(([status, count]) => ({
    name: status === 'draft' ? 'مسودة' : 
          status === 'submitted' ? 'مُرسل' : 
          status === 'approved' ? 'موافق عليه' : 
          status === 'rejected' ? 'مرفوض' : status,
    value: count
  }))

  const planChartData = Object.entries(analytics.planStats).map(([plan, data]) => ({
    plan,
    count: data.count,
    revenue: data.revenue
  }))

  const jobTypeChartData = Object.entries(analytics.jobTypeStats).map(([type, count]) => ({
    type: type === 'full-time' ? 'دوام كامل' :
          type === 'part-time' ? 'دوام جزئي' :
          type === 'freelance' ? 'عمل حر' :
          type === 'contract' ? 'عقد' : type,
    count
  }))

  const colors = {
    primary: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
    charts: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'],
    gradients: {
      purple: '#8B5CF6',
      blue: '#06B6D4',
      green: '#10B981',
      orange: '#F59E0B'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-4 sm:mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 space-x-reverse">
            <li className="inline-flex items-center">
              <Link
                href="/admin"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-600"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                الرئيسية
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="mr-1 text-xs sm:text-sm font-medium text-gray-500 md:mr-2">التحليلات</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Data Warning Banner */}
      {analytics && analytics.summary.totalUsers === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-4 mx-4 sm:mx-0 rounded-lg sm:rounded-none">
          <div className="flex flex-col sm:flex-row">
            <div className="flex-shrink-0 mb-2 sm:mb-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="sm:ml-3 flex-1">
              <p className="text-xs sm:text-sm text-yellow-700">
                <strong>تشخيص البيانات:</strong> لا يمكن العثور على بيانات في جدول <code className="bg-yellow-100 px-1 rounded text-xs">profiles</code>.
              </p>
              <div className="mt-2 flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => {
                    // فتح وحدة التحكم وتشغيل اختبار
                    console.clear()
                    console.log('🔍 بدء تشخيص قاعدة البيانات...')
                    
                    // اختبار API
                    fetch('/api/analytics?days=30')
                      .then(res => res.json())
                      .then(data => {
                        console.log('📊 استجابة API:', data)
                        if (data.error) {
                          console.error('❌ خطأ في API:', data.error)
                          console.log('💡 تفاصيل:', data.details)
                        } else if (data.debug) {
                          console.log('🔍 معلومات التشخيص:', data.debug)
                        }
                      })
                      .catch(err => console.error('❌ خطأ في طلب API:', err))
                  }}
                  className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
                >
                  🔍 تشغيل تشخيص
                </button>
                <span className="text-xs text-yellow-600">
                  أو افتح وحدة التحكم (F12) وانسخ محتوى <code>database-check.js</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Banner */}
      {analytics && analytics.summary.totalUsers > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 mb-4 mx-4 sm:mx-0 rounded-lg sm:rounded-none">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs sm:text-sm text-green-700">
                <strong>✅ البيانات محمّلة بنجاح!</strong> تم العثور على {analytics.summary.totalUsers} مستخدم في قاعدة البيانات.
                {analytics.cityStats.length > 0 && ` توزيع على ${analytics.cityStats.length} مدينة مختلفة.`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              لوحة التحليلات
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              نظرة شاملة على أداء المنصة والمستخدمين
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
                <option value="7">آخر 7 أيام</option>
                <option value="30">آخر 30 يوم</option>
                <option value="90">آخر 3 أشهر</option>
                <option value="365">آخر سنة</option>
              </select>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث</span>
              </button>
              
              {/* Export Button */}
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">تصدير</span>
              </button>
            </div>
          </div>
        </div>

      <div className="px-3 sm:px-6 space-y-4 sm:space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <KPICard
            title="إجمالي المستخدمين"
            value={analytics.summary.totalUsers}
            subtitle="المسجلين في المنصة"
            icon={Users}
            color="purple"
            trend={{ value: 12, isPositive: true }}
          />
          
          <KPICard
            title="مستخدمون جدد"
            value={analytics.summary.newUsersInPeriod}
            subtitle={`خلال آخر ${dateRange} يوم`}
            icon={UserPlus}
            color="blue"
            trend={{ value: 8, isPositive: true }}
          />
          
          <KPICard
            title="المدفوعات المكتملة"
            value={analytics.summary.completedPayments}
            subtitle="عملية دفع مُتممة"
            icon={CreditCard}
            color="green"
            trend={{ value: 15, isPositive: true }}
          />
          
          <KPICard
            title="المدفوعات المعلقة"
            value={analytics.summary.pendingPayments}
            subtitle="في انتظار الدفع"
            icon={Clock}
            color="orange"
            trend={{ value: -5, isPositive: false }}
          />
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <KPICard
            title="إجمالي الإيرادات"
            value={`${analytics.summary.totalRevenue.toFixed(2)} دينار`}
            subtitle="من المدفوعات المكتملة"
            icon={DollarSign}
            color="green"
            trend={{ value: 25, isPositive: true }}
          />
          
          <KPICard
            title="معدل التحويل"
            value={`${analytics.summary.conversionRate}%`}
            subtitle="من المستخدمين للعملاء"
            icon={TrendingUp}
            color="blue"
            trend={{ value: 3, isPositive: true }}
          />
          
          <KPICard
            title="متوسط قيمة الطلب"
            value={analytics.summary.completedPayments > 0 
              ? `${(analytics.summary.totalRevenue / analytics.summary.completedPayments).toFixed(2)} دينار`
              : '0 دينار'
            }
            subtitle="لكل عملية دفع"
            icon={Star}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Daily Registrations */}
          <AreaChartComponent
            data={analytics.dailyRegistrations}
            dataKey="count"
            xAxisKey="formattedDate"
            title="التسجيلات اليومية"
            color={colors.gradients.purple}
            height={isMobile ? 250 : 350}
          />
          
          {/* Status Distribution */}
          <PieChartComponent
            data={statusChartData}
            title="توزيع حالات الطلبات"
            colors={colors.charts}
            nameKey="name"
            valueKey="value"
            height={isMobile ? 250 : 350}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Cities */}
          <BarChartComponent
            data={analytics.cityStats.slice(0, 8)}
            dataKey="count"
            xAxisKey="city"
            title="أكثر المدن تسجيلاً"
            color={colors.gradients.blue}
            height={isMobile ? 250 : 350}
          />
          
          {/* Job Types */}
          <PieChartComponent
            data={jobTypeChartData}
            title="أنواع الوظائف المطلوبة"
            colors={colors.charts}
            nameKey="type"
            valueKey="count"
            height={isMobile ? 250 : 350}
          />
        </div>

        {/* Skills and Plans */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Skills */}
          <BarChartComponent
            data={analytics.topSkills.slice(0, 10)}
            dataKey="count"
            xAxisKey="skill"
            title="أكثر المهارات طلباً"
            color={colors.gradients.green}
            height={isMobile ? 250 : 350}
          />
          
          {/* Plan Statistics */}
          <BarChartComponent
            data={planChartData}
            dataKey="count"
            xAxisKey="plan"
            title="إحصائيات الخطط المدفوعة"
            color={colors.gradients.orange}
            height={isMobile ? 250 : 350}
          />
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">ملخص البيانات</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
              <p className="text-purple-600 font-medium text-xs sm:text-sm">فترة التحليل</p>
              <p className="text-gray-800 text-sm sm:text-base">{analytics.period.days} يوم</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-600 font-medium text-xs sm:text-sm">أكثر المدن</p>
              <p className="text-gray-800 text-sm sm:text-base">{analytics.cityStats[0]?.city || 'غير متوفر'}</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <p className="text-green-600 font-medium text-xs sm:text-sm">أكثر المهارات</p>
              <p className="text-gray-800 text-sm sm:text-base">{analytics.topSkills[0]?.skill || 'غير متوفر'}</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
              <p className="text-orange-600 font-medium text-xs sm:text-sm">آخر تحديث</p>
              <p className="text-gray-800 text-sm sm:text-base">{new Date().toLocaleDateString('ar-JO')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}