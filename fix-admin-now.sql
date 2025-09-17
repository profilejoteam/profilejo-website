-- حل سريع ونهائي لمشكلة صلاحيات الإدارة
-- شغل هذا في Supabase SQL Editor

-- 1. إزالة أي مشاكل في RLS
DROP POLICY IF EXISTS "Admins can manage admins" ON admins;
DROP POLICY IF EXISTS "Allow admin access" ON admins;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 2. إزالة البيانات القديمة وإعادة الإنشاء
DELETE FROM admins WHERE email = 'amrabdullah19876@gmail.com';

-- 3. إضافة المدير الأساسي مباشرة
INSERT INTO admins (email, is_active, created_at) 
VALUES ('amrabdullah19876@gmail.com', true, NOW());

-- 4. إضافة في profiles أيضاً كاحتياط
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
SELECT id, email, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'amrabdullah19876@gmail.com'
ON CONFLICT (id) DO UPDATE SET 
  is_admin = true, 
  email = EXCLUDED.email,
  updated_at = NOW();

-- 5. التحقق من النجاح
SELECT 'RESULT' as test, 
       CASE 
         WHEN EXISTS (SELECT 1 FROM admins WHERE email = 'amrabdullah19876@gmail.com' AND is_active = true) 
         THEN '✅ موجود في admins' 
         ELSE '❌ غير موجود في admins' 
       END as admins_status,
       CASE 
         WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'amrabdullah19876@gmail.com' AND is_admin = true) 
         THEN '✅ موجود في profiles' 
         ELSE '❌ غير موجود في profiles' 
       END as profiles_status;