# إعداد سريع لقاعدة البيانات

## الخطوة الأولى: تنفيذ Schema في Supabase

### إذا كان جدول admins غير موجود:

1. اذهب إلى Supabase Dashboard
2. SQL Editor > New Query
3. انسخ والصق هذا الكود:

```sql
-- إنشاء جدول المدراء
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- تفعيل RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- إضافة policy
CREATE POLICY "Admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- إضافة نفسك كمدير (استبدل الإيميل)
INSERT INTO admins (user_id, email)
SELECT id, email FROM auth.users
WHERE email = 'amrabdullah19876@gmail.com';
```

## البديل السريع: استخدام جدول profiles

إذا كان لديك جدول profiles، يمكنك إضافة عمود is_admin:

```sql
-- إضافة عمود is_admin إلى جدول profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- جعلك مدير
UPDATE profiles 
SET is_admin = true 
WHERE email = 'amrabdullah19876@gmail.com';

-- إذا لم يكن لديك profile، أنشئ واحد
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
SELECT id, email, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'amrabdullah19876@gmail.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
```

## التحقق من النجاح:

```sql
-- التحقق من وجود المدير في جدول admins
SELECT * FROM admins WHERE email = 'amrabdullah19876@gmail.com';

-- أو في جدول profiles
SELECT * FROM profiles WHERE email = 'amrabdullah19876@gmail.com' AND is_admin = true;
```