-- إضافة إيميلك في جدول admins
-- يرجى تشغيل هذا في Supabase SQL Editor

-- الحل الأول: التحقق من وجود الإيميل في auth.users
SELECT 'تحقق من auth.users' as step, id, email, created_at 
FROM auth.users 
WHERE email = 'amrabdullah19876@gmail.com';

-- الحل الثاني: إنشاء جدول admins إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS admins (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  email text not null,
  created_at timestamp with time zone null default now(),
  created_by uuid null,
  is_active boolean not null default true,
  constraint admins_pkey primary key (id),
  constraint admins_email_key unique (email),
  constraint admins_created_by_fkey foreign KEY (created_by) references auth.users (id),
  constraint admins_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
);

-- إصلاح مشكلة RLS - إزالة السياسات القديمة وإضافة سياسة صحيحة
DROP POLICY IF EXISTS "Admins can manage admins" ON admins;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- OR إذا كنت تريد RLS، استخدم سياسة بسيطة
-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow admin access" ON admins FOR ALL USING (email = 'amrabdullah19876@gmail.com');

-- الحل الثالث: إضافة الإيميل في جدول admins مع user_id
INSERT INTO admins (user_id, email, is_active, created_at)
SELECT id, email, true, NOW()
FROM auth.users 
WHERE email = 'amrabdullah19876@gmail.com'
ON CONFLICT (email) DO UPDATE SET 
  is_active = true,
  user_id = EXCLUDED.user_id;

-- الحل الرابع: إذا لم يعمل، أضف مباشرة بدون user_id
INSERT INTO admins (email, is_active, created_at)
VALUES ('amrabdullah19876@gmail.com', true, NOW())
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- الحل الخامس: التحقق من النجاح
SELECT 'تحقق من النجاح' as step, * FROM admins WHERE email = 'amrabdullah19876@gmail.com';

-- الحل الاحتياطي: إضافة في جدول profiles أيضاً
-- إضافة أو تحديث البيانات في جدول profiles الموجود
UPDATE profiles 
SET is_admin = true, 
    updated_at = NOW(),
    email = 'amrabdullah19876@gmail.com'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'amrabdullah19876@gmail.com'
);

-- إذا لم يكن موجود، أضفه
INSERT INTO profiles (
  id, 
  user_id, 
  email, 
  is_admin, 
  created_at, 
  updated_at
)
SELECT 
  id, 
  id, -- استخدام نفس الـ id كـ user_id
  email, 
  true, 
  NOW(), 
  NOW()
FROM auth.users 
WHERE email = 'amrabdullah19876@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.users.id
  );

-- التحقق النهائي من الحلول
SELECT 'admins table' as source, email, is_active as admin_status FROM admins WHERE email = 'amrabdullah19876@gmail.com'
UNION ALL
SELECT 'profiles table' as source, email, is_admin::text as admin_status FROM profiles WHERE email = 'amrabdullah19876@gmail.com';