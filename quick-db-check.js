// 🚀 اختبار سريع لاستكشاف البيانات
// انسخ في Console المتصفح (F12)

console.clear()
console.log('🚀 اختبار سريع لاستكشاف البيانات...')

const supabaseUrl = 'https://vklsxpbaaehamjoekcqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrbHN4cGJhYWVoYW1qb2VrY3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTM0MTEsImV4cCI6MjA3MzI2OTQxMX0.r97UcFzcHgjdaNWlMx5fcXTKtAcNXVUFn7ycwJQLSt4'

// فحص سريع للجداول الأساسية
async function quickCheck() {
  const checks = [
    { table: 'profiles', description: 'جدول الملفات الشخصية' },
    { table: 'users', description: 'جدول المستخدمين' },
    { table: 'form_submissions', description: 'جدول استمارات الطلبات' },
    { table: 'applications', description: 'جدول الطلبات' }
  ]
  
  for (const check of checks) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${check.table}?select=count()`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const count = data[0]?.count || 0
        console.log(`✅ ${check.table} (${check.description}): ${count} سجل`)
        
        if (count > 0) {
          // جلب عينة
          const sampleResponse = await fetch(`${supabaseUrl}/rest/v1/${check.table}?select=*&limit=2`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (sampleResponse.ok) {
            const sample = await sampleResponse.json()
            console.log(`   📋 عينة:`, sample)
          }
        }
      } else {
        console.log(`❌ ${check.table}: ${response.status} - ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ ${check.table}: خطأ - ${error.message}`)
    }
  }
}

quickCheck()

// اختبار إضافي: فحص auth.users (إذا كان مسموحاً)
setTimeout(() => {
  console.log('\n🔐 اختبار جدول المصادقة...')
  fetch(`${supabaseUrl}/rest/v1/auth.users?select=count()`, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact'
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json()
    } else {
      console.log(`❌ auth.users: ${response.status} - غير مسموح`)
    }
  })
  .then(data => {
    if (data) {
      const count = data[0]?.count || 0
      console.log(`✅ auth.users: ${count} مستخدم مصادق عليه`)
    }
  })
  .catch(error => {
    console.log(`❌ auth.users: ${error.message}`)
  })
}, 2000)