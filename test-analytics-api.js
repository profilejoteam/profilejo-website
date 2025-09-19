// تشغيل هذا السكريبت لاختبار Analytics API
// node test-analytics-api.js

const testAnalyticsAPI = async () => {
  try {
    console.log('🚀 Testing Analytics API...')
    
    // اختبار API محلياً
    const response = await fetch('http://localhost:3000/api/analytics?days=30')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log('✅ API Response received successfully!')
    console.log('📊 Summary Data:')
    console.log(`   - Total Users: ${data.summary.totalUsers}`)
    console.log(`   - New Users: ${data.summary.newUsersInPeriod}`)
    console.log(`   - Completed Payments: ${data.summary.completedPayments}`)
    console.log(`   - Total Revenue: ${data.summary.totalRevenue} JOD`)
    console.log(`   - Conversion Rate: ${data.summary.conversionRate}%`)
    
    console.log('\n🏙️ Top Cities:')
    data.cityStats.slice(0, 3).forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.city}: ${city.count} users`)
    })
    
    console.log('\n💼 Top Skills:')
    data.topSkills.slice(0, 3).forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.skill}: ${skill.count} mentions`)
    })
    
    console.log('\n📈 Daily Registrations:')
    data.dailyRegistrations.slice(-3).forEach(day => {
      console.log(`   ${day.formattedDate}: ${day.count} registrations`)
    })
    
    console.log('\n🎯 Status Distribution:')
    Object.entries(data.statusDistribution).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message)
    return false
  }
}

// تشغيل الاختبار فقط إذا تم استدعاء الملف مباشرة
if (typeof window === 'undefined') {
  // في بيئة Node.js
  const fetch = require('node-fetch')
  testAnalyticsAPI()
} else {
  // في المتصفح
  console.log('يمكنك تشغيل testAnalyticsAPI() في وحدة تحكم المتصفح')
}

// تصدير الدالة للاستخدام في المتصفح
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAnalyticsAPI }
}