// script للتحقق من صلاحيات الإدارة
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ متغيرات البيئة للـ Supabase غير موجودة')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdmin() {
  const email = 'amrabdullah19876@gmail.com' // استبدل بإيميلك
  
  console.log('🔍 التحقق من صلاحيات الإدارة لـ:', email)
  
  // التحقق من جدول admins
  try {
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
    
    console.log('\n📋 نتائج البحث في جدول admins:')
    if (adminError) {
      console.error('❌ خطأ:', adminError.message)
    } else if (adminData?.length > 0) {
      console.log('✅ موجود في جدول admins:', adminData)
    } else {
      console.log('❌ غير موجود في جدول admins')
    }
  } catch (error) {
    console.error('❌ خطأ في الوصول لجدول admins:', error.message)
  }
  
  // التحقق من جدول profiles
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
    
    console.log('\n📋 نتائج البحث في جدول profiles:')
    if (profileError) {
      console.error('❌ خطأ:', profileError.message)
    } else if (profileData?.length > 0) {
      console.log('✅ موجود في جدول profiles:', profileData)
    } else {
      console.log('❌ غير موجود في جدول profiles')
    }
  } catch (error) {
    console.error('❌ خطأ في الوصول لجدول profiles:', error.message)
  }
  
  // التحقق من جدول auth.users
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    console.log('\n📋 بيانات المستخدم الحالي:')
    if (userError) {
      console.error('❌ خطأ:', userError.message)
    } else if (userData?.user) {
      console.log('✅ المستخدم الحالي:', userData.user.email)
    } else {
      console.log('❌ لا يوجد مستخدم مسجل دخول')
    }
  } catch (error) {
    console.error('❌ خطأ في الحصول على بيانات المستخدم:', error.message)
  }
}

checkAdmin()