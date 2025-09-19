// سكريبت سريع لاختبار analytics API
// افتح وحدة تحكم المتصفح في صفحة admin وشغل هذا الكود

async function testAnalyticsAPI() {
  try {
    console.log('🚀 Testing Analytics API...')
    
    const response = await fetch('/api/analytics?days=30')
    console.log('📡 Response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📊 Full API Response:', data)
    
    if (data.error) {
      console.error('❌ API returned error:', data.error)
      console.log('🔍 Debug info:', data.debug)
      return false
    }
    
    console.log('✅ API Response received successfully!')
    console.log('📈 Summary Data:')
    console.log(`   - Total Users: ${data.summary.totalUsers}`)
    console.log(`   - New Users: ${data.summary.newUsersInPeriod}`)
    console.log(`   - Completed Payments: ${data.summary.completedPayments}`)
    console.log(`   - Pending Payments: ${data.summary.pendingPayments}`)
    console.log(`   - Total Revenue: ${data.summary.totalRevenue} JOD`)
    console.log(`   - Conversion Rate: ${data.summary.conversionRate}%`)
    
    console.log('\n🏙️ Top Cities:')
    data.cityStats.slice(0, 5).forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.city}: ${city.count} users`)
    })
    
    console.log('\n💼 Top Skills:')
    data.topSkills.slice(0, 5).forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.skill}: ${skill.count} mentions`)
    })
    
    console.log('\n📋 Status Distribution:')
    Object.entries(data.statusDistribution).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message)
    return false
  }
}

// شغل الاختبار
testAnalyticsAPI()