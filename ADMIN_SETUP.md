# دليل إضافة مدراء جدد

## الطريقة الأولى: عبر لوحة الإدارة

1. اذهب إلى `/admin/admins`
2. اضغط "إضافة مدير جديد"
3. ابحث عن المستخدم بالإيميل أو أدخل إيميل مباشرة
4. اضغط "إضافة كمدير"

⚠️ **تأكد من أن المستخدم مسجل في النظام أولاً**

## الطريقة الثانية: عبر SQL Editor في Supabase

### خطوة 1: تشغيل schema update
```sql
-- في Supabase SQL Editor، نفذ محتوى ملف supabase-update-schema.sql
```

### خطوة 2: إضافة مدير جديد
```sql
-- استبدل 'admin@example.com' بالإيميل المطلوب
SELECT set_user_as_admin('admin@example.com');
```

### خطوة 3: التحقق من الإضافة
```sql
-- عرض جميع المدراء
SELECT id, email, is_admin, created_at 
FROM profiles 
WHERE is_admin = true;
```

### إزالة صلاحيات مدير
```sql
-- استبدل 'admin@example.com' بالإيميل المطلوب
SELECT remove_admin_status('admin@example.com');
```

## الطريقة الثالثة: يدوياً في قاعدة البيانات

### إضافة عمود is_admin إذا لم يكن موجوداً
```sql
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
```

### إضافة مدير مباشرة
```sql
-- إذا كان المستخدم موجود في profiles
UPDATE profiles 
SET is_admin = true, updated_at = NOW()
WHERE email = 'admin@example.com';

-- إذا لم يكن موجود، أنشئ profile جديد
INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
SELECT id, email, true, NOW(), NOW()
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true, updated_at = NOW();
```

## ملاحظات مهمة

1. **الأمان**: المدراء لديهم صلاحية كاملة على النظام
2. **التحقق**: تأكد من أن المستخدم موثوق قبل منحه صلاحيات إدارية
3. **النسخ الاحتياطي**: احتفظ بنسخة من قاعدة البيانات قبل إجراء تغييرات
4. **الاختبار**: جرب الصلاحيات أولاً على بيئة التطوير

## استكشاف الأخطاء

### المستخدم غير موجود
```sql
-- تحقق من وجود المستخدم في auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@example.com';
```

### فحص الصلاحيات
```sql
-- تحقق من صلاحيات مستخدم معين
SELECT p.id, p.email, p.is_admin, au.email as auth_email
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email = 'admin@example.com';
```

### إعادة تعيين جميع الصلاحيات
```sql
-- إزالة صلاحيات الإدارة من جميع المستخدمين (خطر!)
UPDATE profiles SET is_admin = false;

-- ثم إضافة المدير الأساسي
UPDATE profiles SET is_admin = true WHERE email = 'your-main-admin@example.com';
```