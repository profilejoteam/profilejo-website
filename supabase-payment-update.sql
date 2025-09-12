-- إضافة أعمدة الدفع والخطط المفقودة إلى جدول profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_plan VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_price DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_currency VARCHAR(10) DEFAULT 'JOD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);

-- إنشاء جدول منفصل للمدفوعات (اختياري - للتتبع الأفضل)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'JOD',
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_reference VARCHAR(100),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_profile_id_idx ON payments(profile_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(payment_status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments(created_at);

-- Update trigger for payments
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();