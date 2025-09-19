import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    console.log('🔍 Analytics API called with days:', days)
    
    // استخدام anon key مع session للتأكد من الوصول
    const supabaseUrl = 'https://vklsxpbaaehamjoekcqj.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbHN4cGJhYWVoYW1qb2VrY3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTM0MTEsImV4cCI6MjA3MzI2OTQxMX0.r97UcFzcHgjdaNWlMx5fcXTKtAcNXVUFn7ycwJQLSt4'
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // حساب التواريخ
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    console.log('📅 Date range:', { 
      startDate: startDate.toISOString().split('T')[0], 
      endDate: endDate.toISOString().split('T')[0] 
    })

    // اختبار الاتصال أولاً
    console.log('🔗 Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    console.log('🔗 Connection test:', { testData, testError })

    if (testError) {
      console.error('❌ Database connection failed:', testError)
      return NextResponse.json({
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 })
    }

    // 1. إجمالي عدد المستخدمين باستخدام عدة طرق
    console.log('👥 Fetching total users...')
    
    // الطريقة الأولى: استخدام count
    const { count: totalUsersCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log('📊 Count method result:', { totalUsersCount, countError })

    // الطريقة الثانية: جلب البيانات الفعلية
    const { data: allProfiles, error: dataError } = await supabase
      .from('profiles')
      .select('id, created_at, status, city, plan_name, plan_price, payment_status, skills, desired_job_type')
      .order('created_at', { ascending: false })
      .limit(1000) // حد أقصى 1000 للاختبار

    console.log('📊 Data method result:', { 
      count: allProfiles?.length, 
      dataError,
      sampleData: allProfiles?.slice(0, 3) // أول 3 عناصر للفحص
    })

    if (dataError) {
      console.error('❌ Error fetching profiles data:', dataError)
      return NextResponse.json({
        error: 'Failed to fetch profiles data',
        details: dataError.message,
        code: dataError.code
      }, { status: 500 })
    }

    const totalUsers = allProfiles?.length || 0
    console.log('✅ Total users found:', totalUsers)

    if (totalUsers === 0) {
      console.warn('⚠️ No profiles found in database')
      return NextResponse.json({
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
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          days
        },
        debug: {
          message: 'No profiles found in database',
          totalUsers,
          connectionWorking: true
        }
      })
    }

    // 2. حساب المستخدمين الجدد
    const newUsers = allProfiles?.filter(profile => {
      const createdAt = new Date(profile.created_at)
      return createdAt >= startDate && createdAt <= endDate
    }) || []

    console.log('🆕 New users in period:', newUsers.length)

    // 3. توزيع حالات الطلبات
    const statusCounts = allProfiles?.reduce((acc: Record<string, number>, profile: any) => {
      const status = profile.status || 'draft'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {}) || {}

    console.log('📋 Status distribution:', statusCounts)

    // 4. توزيع المدن
    const cityStats = allProfiles?.reduce((acc: Record<string, number>, profile: any) => {
      const city = profile.city || 'غير محدد'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {}) || {}

    const topCities = Object.entries(cityStats)
      .map(([city, count]) => ({ city, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)

    console.log('🏙️ Top cities:', topCities.slice(0, 5))

    // 5. إحصائيات الدفع
    const completedPayments = allProfiles?.filter(p => p.payment_status === 'completed').length || 0
    const pendingPayments = allProfiles?.filter(p => p.payment_status === 'pending').length || 0

    // 6. إجمالي الإيرادات
    const totalRevenue = allProfiles?.reduce((sum: number, profile: any) => {
      if (profile.payment_status === 'completed' && profile.plan_price) {
        return sum + parseFloat(profile.plan_price)
      }
      return sum
    }, 0) || 0

    // 7. إحصائيات الخطط
    const planStats = allProfiles?.reduce((acc: Record<string, any>, profile: any) => {
      const planName = profile.plan_name || 'غير محدد'
      if (!acc[planName]) {
        acc[planName] = { count: 0, revenue: 0 }
      }
      acc[planName].count += 1
      if (profile.payment_status === 'completed' && profile.plan_price) {
        acc[planName].revenue += parseFloat(profile.plan_price)
      }
      return acc
    }, {}) || {}

    // 8. المهارات الأكثر طلباً
    const skillsCount: Record<string, number> = {}
    allProfiles?.forEach((profile: any) => {
      if (profile.skills && Array.isArray(profile.skills)) {
        profile.skills.forEach((skill: string) => {
          if (skill && skill.trim()) {
            skillsCount[skill] = (skillsCount[skill] || 0) + 1
          }
        })
      }
    })

    const topSkills = Object.entries(skillsCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)

    // 9. أنواع الوظائف
    const jobTypeStats = allProfiles?.reduce((acc: Record<string, number>, profile: any) => {
      const jobType = profile.desired_job_type || 'غير محدد'
      acc[jobType] = (acc[jobType] || 0) + 1
      return acc
    }, {}) || {}

    // 10. التسجيلات اليومية
    const dailyStats: Record<string, number> = {}
    allProfiles?.forEach((profile: any) => {
      const date = new Date(profile.created_at).toISOString().split('T')[0]
      dailyStats[date] = (dailyStats[date] || 0) + 1
    })

    const dailyData = Object.entries(dailyStats)
      .map(([date, count]) => ({
        date,
        count,
        formattedDate: new Date(date).toLocaleDateString('ar-JO')
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // آخر 30 يوم

    const response = {
      summary: {
        totalUsers,
        newUsersInPeriod: newUsers.length,
        completedPayments,
        pendingPayments,
        totalRevenue,
        conversionRate: totalUsers > 0 ? Math.round(completedPayments / totalUsers * 100) : 0
      },
      statusDistribution: statusCounts,
      cityStats: topCities,
      planStats,
      dailyRegistrations: dailyData,
      topSkills,
      jobTypeStats,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days
      }
    }

    console.log('🎉 Analytics processed successfully:', {
      totalUsers,
      newUsers: newUsers.length,
      completedPayments,
      totalRevenue,
      topCitiesCount: topCities.length,
      topSkillsCount: topSkills.length
    })

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Analytics API Error:', error)
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: 'Check server console for more details'
    }, { status: 500 })
  }
}