-- ============================================================
--   ProfileJo — Complete Supabase Schema
--   Run this ONCE on a fresh Supabase project (SQL Editor)
--   Date: 2026-04-24
-- ============================================================

-- ──────────────────────────────────────────────
-- 0. HELPER: updated_at trigger function
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────
-- 1. PROFILES  (core table)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- ── سؤال البداية ──
  is_recent_graduate     BOOLEAN DEFAULT false,

  -- ── القسم 1 — المسمى الوظيفي المستهدف ──
  target_job_title       VARCHAR(200),
  target_company         VARCHAR(200),

  -- ── القسم 2 — المعلومات الشخصية ──
  full_name              VARCHAR(100) NOT NULL CHECK (char_length(full_name) >= 2),
  date_of_birth          DATE,
  city                   VARCHAR(100),
  country                VARCHAR(100) DEFAULT 'الأردن',
  phone                  VARCHAR(30),
  email                  VARCHAR(255) NOT NULL,
  linkedin_url           TEXT,

  -- ── القسم 3 — الهدف الوظيفي / النبذة ──
  summary                TEXT,                          -- AI يساعد هنا

  -- ── القسم 4 — الخبرات العملية (JSONB array) ──
  -- كل عنصر: { companyName, jobTitle, startDate, endDate, isPresent,
  --             responsibilities, achievements, employmentType,
  --             location, referenceName, referenceContact }
  experience             JSONB NOT NULL DEFAULT '[]',

  -- ── القسم 5 — التعليم (JSONB array) ──
  -- كل عنصر: { degree, major, university, faculty,
  --             startDate, graduationDate, isPresent, gpa, gpaScale, notes }
  education              JSONB NOT NULL DEFAULT '[]',

  -- ── القسم 6 — المهارات (JSONB) ──
  -- technical_skills: string[]
  -- soft_skills: string[]
  -- languages_known: { name, level }[]
  technical_skills       JSONB DEFAULT '[]',
  soft_skills            JSONB DEFAULT '[]',
  languages_known        JSONB DEFAULT '[]',           -- {name, level}[]

  -- ── القسم 7 — الدورات والشهادات (JSONB array) ──
  -- كل عنصر: { certName, issuer, date, credentialId, credentialUrl }
  certifications         JSONB DEFAULT '[]',

  -- ── القسم 8 — المشاريع (JSONB array) ──
  -- كل عنصر: { projectName, description, role, technologies[],
  --             demoLink, repositoryUrl, isPublic }
  projects               JSONB DEFAULT '[]',

  -- ── القسم 9 — الإنجازات/الجوائز (JSONB array) ──
  -- كل عنصر: { details, issuer, date }
  achievements           JSONB DEFAULT '[]',

  -- ── القسم 10 — معلومات إضافية ──
  volunteer_work         TEXT,
  interests              TEXT,

  -- ── الملفات ──
  photo_url              TEXT,
  portfolio_files        JSONB DEFAULT '[]',

  -- ── الموافقات القانونية ──
  data_usage_consent     BOOLEAN NOT NULL DEFAULT false,
  marketing_consent      BOOLEAN DEFAULT false,

  -- ── الخطة المشتراة ──
  selected_plan          VARCHAR(50),
  plan_name              VARCHAR(100),
  plan_price             DECIMAL(10,2),
  plan_currency          VARCHAR(10),
  plan_duration          VARCHAR(50),

  -- ── الدفع ──
  payment_method         VARCHAR(50),
  payment_status         VARCHAR(50) DEFAULT 'pending',
  payment_id             VARCHAR(255),
  payment_date           TIMESTAMP WITH TIME ZONE,
  payment_amount         DECIMAL(10,2),

  -- ── الاشتراك ──
  subscription_status    VARCHAR(50) DEFAULT 'inactive',
  subscription_start     TIMESTAMP WITH TIME ZONE,
  subscription_end       TIMESTAMP WITH TIME ZONE,

  -- ── حالة الطلب ──
  -- draft | submitted | under_review | approved | delivered | cancelled
  status                 VARCHAR(30) DEFAULT 'draft',
  submission_date        TIMESTAMP WITH TIME ZONE,
  admin_notes            TEXT,

  -- ── ميتاداتا ──
  created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS profiles_user_id_idx         ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_status_idx          ON profiles(status);
CREATE INDEX IF NOT EXISTS profiles_payment_status_idx  ON profiles(payment_status);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx      ON profiles(created_at);
CREATE INDEX IF NOT EXISTS profiles_city_idx            ON profiles(city);

-- updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 2. PROFILE FILES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- photo | diploma | certificate | portfolio | proof
  file_type   VARCHAR(50) NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   INTEGER,
  mime_type   VARCHAR(100),

  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pf_profile_id_idx ON profile_files(profile_id);
CREATE INDEX IF NOT EXISTS pf_user_id_idx    ON profile_files(user_id);

ALTER TABLE profile_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own files" ON profile_files FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 3. ADMINS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can see other admins
CREATE POLICY "Admins manage admins" ON admins FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND is_active = true)
);

-- ── Helper: is current user an admin? ──
CREATE OR REPLACE FUNCTION is_admin(check_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  target_email TEXT;
BEGIN
  IF check_email IS NULL THEN
    SELECT email INTO target_email FROM auth.users WHERE id = auth.uid();
  ELSE
    target_email := check_email;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE email = target_email AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Admin: view all profiles (admin only) ──
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin());

-- ──────────────────────────────────────────────
-- 4. PLANS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id          VARCHAR(50) PRIMARY KEY,   -- 'basic' | 'professional' | 'premium'
  name        VARCHAR(100) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  currency    VARCHAR(10) NOT NULL DEFAULT 'JOD',
  duration    VARCHAR(50),
  description TEXT,
  features    JSONB DEFAULT '[]',        -- string[]
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default plans
INSERT INTO plans (id, name, price, currency, duration, description, features, sort_order) VALUES
  ('basic',        'الأساسية',  25, 'JOD', 'شهر واحد',   'مثالية للمبتدئين',
   '["بروفايل شخصي احترافي","سيرة ذاتية بتصميم أنيق","مراجعة من خبير موارد بشرية","تسليم خلال 5 أيام عمل"]', 1),
  ('professional', 'المهنية',   45, 'JOD', 'شهرين',      'الأكثر شعبية',
   '["كل ما في الأساسية","تحسين بروفايل LinkedIn","استراتيجية بحث عن عمل","تسليم خلال 3 أيام عمل"]', 2),
  ('premium',      'المتميزة',  75, 'JOD', '3 أشهر',     'للمهنيين الطموحين',
   '["كل ما في المهنية","جلسة كوتشينج شخصية","متابعة شهرية","تسليم خلال يوم عمل واحد"]', 3)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────
-- 5. ORDERS
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,

  order_number    VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_order_number(),
  plan_id         VARCHAR(50) REFERENCES plans(id),
  plan_name       VARCHAR(100),
  plan_price      DECIMAL(10,2),
  plan_currency   VARCHAR(10),

  payment_method  VARCHAR(50),          -- cliq | western_union | bank | cash
  payment_status  VARCHAR(30) DEFAULT 'pending',   -- pending | confirmed | failed | refunded
  payment_id      VARCHAR(255),
  payment_date    TIMESTAMP WITH TIME ZONE,

  -- pending | confirmed | in_progress | completed | cancelled
  order_status    VARCHAR(30) DEFAULT 'pending',
  notes           TEXT,
  admin_notes     TEXT,

  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx       ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_order_number_idx  ON orders(order_number);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_order_status_idx  ON orders(order_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx    ON orders(created_at);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders"   ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders"  ON orders FOR SELECT USING (is_admin());
CREATE POLICY "Admins update orders"    ON orders FOR UPDATE USING (is_admin());

-- ──────────────────────────────────────────────
-- 6. NOTIFICATIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- order_received | payment_confirmed | work_started | work_completed | general
  type        VARCHAR(50) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,

  is_read     BOOLEAN DEFAULT false,
  is_sent     BOOLEAN DEFAULT false,

  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notif_user_id_idx    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notif_is_read_idx    ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notif_created_at_idx ON notifications(created_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"   ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins insert notifications"    ON notifications FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Users mark notifications read"  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- 7. AI CHAT LOGS  (اختياري — للتحليل والتحسين)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,

  current_step    INTEGER,
  field_context   TEXT,
  user_message    TEXT NOT NULL,
  ai_response     TEXT,
  tokens_used     INTEGER,
  model           VARCHAR(50) DEFAULT 'gpt-4o-mini',
  response_ms     INTEGER,     -- وقت الاستجابة بالمللي ثانية

  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_logs_user_id_idx  ON ai_chat_logs(user_id);
CREATE INDEX IF NOT EXISTS ai_logs_created_at   ON ai_chat_logs(created_at);

ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own AI logs" ON ai_chat_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all AI logs" ON ai_chat_logs FOR SELECT USING (is_admin());

-- ──────────────────────────────────────────────
-- 8. ANALYTICS EVENTS  (page views, button clicks)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,

  event_type  VARCHAR(100) NOT NULL,   -- page_view | form_start | form_complete | plan_click | ...
  page        VARCHAR(200),
  properties  JSONB DEFAULT '{}',

  ip_hash     TEXT,         -- مُشفَّر للخصوصية
  user_agent  TEXT,

  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view analytics"       ON analytics_events FOR SELECT USING (is_admin());

-- ──────────────────────────────────────────────
-- 9. STORAGE BUCKETS  (تشغيلها في Supabase Dashboard > Storage)
-- ──────────────────────────────────────────────
-- اصنع هذه الـ buckets يدوياً من لوحة Supabase:
--
--  ┌─────────────────────┬──────────┬────────────────────────────────┐
--  │ Bucket Name         │ Public?  │ الغرض                           │
--  ├─────────────────────┼──────────┼────────────────────────────────┤
--  │ profile-photos      │  نعم     │ الصور الشخصية                  │
--  │ profile-documents   │  لا      │ الشهادات والوثائق               │
--  │ portfolio-files     │  نعم     │ نماذج الأعمال                   │
--  └─────────────────────┴──────────┴────────────────────────────────┘

-- ──────────────────────────────────────────────
-- 10. USEFUL VIEWS  (للـ Admin Dashboard)
-- ──────────────────────────────────────────────

-- ملخص سريع لكل طلب
CREATE OR REPLACE VIEW admin_profiles_view AS
SELECT
  p.id,
  p.user_id,
  p.full_name,
  p.email,
  p.phone,
  p.city,
  p.country,
  p.target_job_title,
  p.selected_plan,
  p.payment_status,
  p.status,
  p.submission_date,
  p.created_at,
  jsonb_array_length(p.experience)     AS experience_count,
  jsonb_array_length(p.education)      AS education_count,
  jsonb_array_length(p.achievements)   AS achievements_count
FROM profiles p;

-- إحصائيات يومية للأدمن
CREATE OR REPLACE VIEW daily_stats AS
SELECT
  DATE(created_at)                                    AS day,
  COUNT(*)                                            AS total_profiles,
  COUNT(*) FILTER (WHERE status = 'submitted')        AS submitted,
  COUNT(*) FILTER (WHERE payment_status = 'confirmed') AS paid,
  SUM(plan_price) FILTER (WHERE payment_status = 'confirmed') AS revenue_jod
FROM profiles
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- ──────────────────────────────────────────────
-- 11. ADMIN HELPER FUNCTIONS
-- ──────────────────────────────────────────────

-- إضافة أدمن جديد
CREATE OR REPLACE FUNCTION add_admin(admin_email TEXT)
RETURNS TEXT AS $$
DECLARE
  target_user_id UUID;
BEGIN
  IF EXISTS(SELECT 1 FROM admins WHERE is_active = true) THEN
    IF NOT is_admin() THEN
      RETURN 'خطأ: ليس لديك صلاحيات إدارية';
    END IF;
  END IF;

  SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;
  IF target_user_id IS NULL THEN
    RETURN 'خطأ: المستخدم غير موجود — ' || admin_email;
  END IF;

  IF is_admin(admin_email) THEN
    RETURN 'المستخدم ' || admin_email || ' مدير بالفعل';
  END IF;

  INSERT INTO admins (user_id, email, created_by)
  VALUES (target_user_id, admin_email, auth.uid())
  ON CONFLICT (email) DO UPDATE SET is_active = true;

  RETURN 'تم إضافة ' || admin_email || ' كمدير';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إزالة أدمن
CREATE OR REPLACE FUNCTION remove_admin(admin_email TEXT)
RETURNS TEXT AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN 'خطأ: ليس لديك صلاحيات إدارية';
  END IF;
  IF admin_email = (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
    RETURN 'خطأ: لا يمكنك إزالة نفسك';
  END IF;

  UPDATE admins SET is_active = false WHERE email = admin_email;
  RETURN 'تم إزالة صلاحيات ' || admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تغيير حالة الطلب (أدمن)
CREATE OR REPLACE FUNCTION update_profile_status(
  profile_uuid UUID,
  new_status   TEXT,
  note         TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN 'خطأ: ليس لديك صلاحيات';
  END IF;

  UPDATE profiles
  SET
    status      = new_status,
    admin_notes = COALESCE(note, admin_notes),
    submission_date = CASE WHEN new_status = 'submitted' THEN NOW() ELSE submission_date END
  WHERE id = profile_uuid;

  RETURN 'تم تحديث الحالة إلى: ' || new_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────
-- ✅ الانتهاء — Schema جاهز
-- ──────────────────────────────────────────────
