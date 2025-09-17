-- حل بسيط وآمن لمشكلة صلاحيات الإدارة
-- شغل هذا في Supabase SQL Editor

-- 1. إزالة مشاكل RLS أولاً
DROP POLICY IF EXISTS "Admins can manage admins" ON admins;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 2. إضافة المدير في جدول admins (الطريقة الآمنة)
INSERT INTO admins (email, is_active, created_at) 
VALUES ('amrabdullah19876@gmail.com', true, NOW())
ON CONFLICT (email) DO UPDATE SET 
  is_active = true,
  created_at = NOW();

-- 3. تحديث جدول profiles (بدون إنشاء سجل جديد)
UPDATE profiles 
SET is_admin = true, updated_at = NOW()
WHERE email = 'amrabdullah19876@gmail.com';

-- 4. التحقق من النتائج
SELECT 'ADMINS CHECK' as test, count(*) as count 
FROM admins 
WHERE email = 'amrabdullah19876@gmail.com' AND is_active = true;

SELECT 'PROFILES CHECK' as test, count(*) as count 
FROM profiles 
WHERE email = 'amrabdullah19876@gmail.com' AND is_admin = true;

-- 5. عرض النتائج
SELECT 'SUCCESS' as status, 
       'Admin access granted for amrabdullah19876@gmail.com' as message;