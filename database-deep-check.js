// 🔍 فحص شامل لقاعدة البيانات
// انسخ هذا الكود في Console المتصفح (F12)

console.clear()
console.log('🔍 بدء الفحص الشامل لقاعدة البيانات...')

// إعداد Supabase
const supabaseUrl = 'https://vklsxpbaaehamjoekcqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbHN4cGJhYWVoYW1qb2VrY3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTM0MTEsImV4cCI6MjA3MzI2OTQxMX0.r97UcFzcHgjdaNWlMx5fcXTKtAcNXVUFn7ycwJQLSt4'

// قائمة الجداول المحتملة للبحث
const possibleTables = [
  'profiles',
  'profile', 
  'users', 
  'user',
  'applications',
  'applicants',
  'form_submissions',
  'submissions',
  'user_profiles',
  'customer_profiles',
  'job_applications'
]

async function checkDatabase() {
  console.log('📋 فحص الجداول المحتملة...')
  
  for (const tableName of possibleTables) {
    try {
      console.log(`\n🔍 فحص جدول: ${tableName}`)
      
      // محاولة جلب عدد السجلات
      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&limit=0`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      })
      
      if (response.ok) {
        const contentRange = response.headers.get('content-range')
        const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0
        
        console.log(`✅ ${tableName}: موجود - ${count} سجل`)
        
        if (count > 0) {
          // جلب عينة من البيانات
          const sampleResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&limit=3`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (sampleResponse.ok) {
            const sampleData = await sampleResponse.json()
            console.log(`📊 عينة من البيانات:`, sampleData)
          }
        }
        
        // إذا وجدنا جدول به بيانات، نتوقف
        if (count > 0) {
          console.log(`🎯 تم العثور على بيانات في جدول: ${tableName}`)
          return { foundTable: tableName, count }
        }
        
      } else {
        console.log(`❌ ${tableName}: غير موجود أو غير مسموح`)
      }
      
    } catch (error) {
      console.log(`❌ ${tableName}: خطأ -`, error.message)
    }
  }
  
  console.log('\n🔍 فحص إضافي: البحث في metadata...')
  
  // محاولة الحصول على قائمة الجداول من الـ schema
  try {
    const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/?select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📋 معلومات Schema:', {
      status: schemaResponse.status,
      headers: Object.fromEntries(schemaResponse.headers.entries())
    })
    
  } catch (error) {
    console.log('❌ فشل في الحصول على معلومات Schema:', error)
  }
  
  return null
}

// تشغيل الفحص
checkDatabase().then(result => {
  if (result) {
    console.log(`\n🎉 خلاصة الفحص: تم العثور على ${result.count} سجل في جدول "${result.foundTable}"`)
    console.log('💡 تأكد من أن Analytics API يستخدم نفس اسم الجدول')
  } else {
    console.log('\n⚠️ خلاصة الفحص: لم يتم العثور على أي بيانات في الجداول المفحوصة')
    console.log('💡 تحقق من:')
    console.log('   1. هل تم إدخال بيانات فعلاً؟')
    console.log('   2. هل اسم الجدول صحيح؟')
    console.log('   3. هل RLS policies تسمح بقراءة البيانات؟')
  }
}).catch(error => {
  console.error('❌ خطأ في الفحص الشامل:', error)
})