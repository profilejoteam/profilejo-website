// سكريبت للتحقق من البيانات في قاعدة البيانات
// انسخ هذا في وحدة تحكم المتصفح

async function checkDatabase() {
  console.log('🔍 فحص قاعدة البيانات...')
  
  try {
    // 1. اختبار Analytics API
    console.log('📡 اختبار Analytics API...')
    const analyticsResponse = await fetch('/api/analytics?days=30')
    const analyticsData = await analyticsResponse.json()
    
    console.log('📊 استجابة Analytics API:', analyticsData)
    
    if (analyticsData.error) {
      console.error('❌ خطأ في Analytics API:', analyticsData.error)
      console.log('🔍 تفاصيل الخطأ:', analyticsData.details)
      return false
    }
    
    if (analyticsData.summary.totalUsers > 0) {
      console.log('✅ تم العثور على بيانات!')
      console.log(`👥 إجمالي المستخدمين: ${analyticsData.summary.totalUsers}`)
      console.log(`🏙️ عدد المدن: ${analyticsData.cityStats.length}`)
      console.log(`🎯 عدد المهارات: ${analyticsData.topSkills.length}`)
      console.log(`💰 إجمالي الإيرادات: ${analyticsData.summary.totalRevenue} دينار`)
      
      console.log('\n🏙️ أكثر المدن:')
      analyticsData.cityStats.slice(0, 5).forEach((city, i) => {
        console.log(`  ${i+1}. ${city.city}: ${city.count}`)
      })
      
      console.log('\n🎯 أكثر المهارات:')
      analyticsData.topSkills.slice(0, 5).forEach((skill, i) => {
        console.log(`  ${i+1}. ${skill.skill}: ${skill.count}`)
      })
      
      return true
    } else {
      console.warn('⚠️ لم يتم العثور على بيانات')
      console.log('🔍 تفاصيل إضافية:', analyticsData.debug)
      return false
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error)
    return false
  }
}

// 2. اختبار مباشر لقاعدة البيانات
async function testSupabaseDirect() {
  console.log('\n🔗 اختبار مباشر لقاعدة البيانات...')
  
  try {
    // استيراد Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vklsxpbaaehamjoekcqj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbHN4cGJhYWVoYW1qb2VrY3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTM0MTEsImV4cCI6MjA3MzI2OTQxMX0.r97UcFzcHgjdaNWlMx5fcXTKtAcNXVUFn7ycwJQLSt4'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // اختبار الاتصال
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log('📊 نتيجة الاختبار المباشر:', { count, error })
    
    if (error) {
      console.error('❌ خطأ في الاتصال المباشر:', error)
      if (error.code === 'PGRST116') {
        console.log('💡 الجدول غير موجود أو لا يمكن الوصول إليه')
      } else if (error.code === '42501') {
        console.log('💡 مشكلة في الصلاحيات - RLS قد يكون يمنع الوصول')
      }
      return false
    }
    
    if (count && count > 0) {
      console.log(`✅ تم العثور على ${count} سجل في جدول profiles`)
      
      // جلب بعض البيانات الفعلية
      const { data: sampleData, error: sampleError } = await supabase
        .from('profiles')
        .select('id, full_name, city, created_at, status')
        .limit(5)
      
      if (!sampleError && sampleData) {
        console.log('📋 عينة من البيانات:')
        sampleData.forEach((profile, i) => {
          console.log(`  ${i+1}. ${profile.full_name} - ${profile.city} - ${profile.status}`)
        })
      }
      
      return true
    } else {
      console.warn('⚠️ الجدول موجود لكن فارغ')
      return false
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار المباشر:', error)
    return false
  }
}

// شغل الاختبارات
console.log('🚀 بدء فحص قاعدة البيانات...')
checkDatabase().then(success => {
  if (!success) {
    console.log('\n🔄 جاري المحاولة مع الاختبار المباشر...')
    testSupabaseDirect()
  }
})