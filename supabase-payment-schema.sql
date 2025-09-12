-- Add comprehensive profile fields to profiles table

-- Add project-related columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]';

-- Add skills-related columns  
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]';

-- Add languages column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]';

-- Add photo column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Update existing columns to match comprehensive form
-- (Most fields already exist in the original schema)

-- Ensure all existing fields are compatible with the new form structure
-- The original schema already includes:
-- - education JSONB
-- - experience JSONB  
-- - projects JSONB (now being added)
-- - skills JSONB (now being added)
-- - languages JSONB (now being added)
-- - certifications JSONB (already exists)
-- - preferred_roles JSONB (already exists)
-- - preferred_industries JSONB (already exists)
-- - availability_date DATE (already exists)
-- - desired_job_type VARCHAR(50) (already exists)
-- - willing_to_relocate BOOLEAN (already exists)
-- - expected_salary_range VARCHAR(100) (already exists)
-- - remote_ok BOOLEAN (already exists)
-- - portfolio_files JSONB (already exists)

-- Add plan-related columns (from previous update)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS selected_plan VARCHAR(50),
ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS plan_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS plan_currency VARCHAR(10),
ADD COLUMN IF NOT EXISTS plan_duration VARCHAR(50);

-- Add payment-related columns (from previous update)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);

-- Add subscription-related columns (from previous update)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';

-- Create orders table for tracking purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Order details
  order_number VARCHAR(100) UNIQUE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  plan_currency VARCHAR(10) NOT NULL,
  
  -- Payment details
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Order status
  order_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for orders table
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON orders(order_number);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_order_status_idx ON orders(order_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(100) AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create notifications table for tracking communication
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Notification details
  type VARCHAR(50) NOT NULL, -- 'order_received', 'payment_confirmed', 'work_started', 'work_completed'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for notifications table
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- Add some sample data for testing (optional)
-- This will be commented out in production
/*
INSERT INTO plans (id, name, price, currency, duration, description, features, is_active) VALUES
('basic', 'الأساسية', 25, 'JOD', 'شهر واحد', 'مثالية للمبتدئين', '["إنشاء بروفايل شخصي أساسي", "كتابة سيرة ذاتية احترافية"]', true),
('professional', 'المهنية', 45, 'JOD', 'شهرين', 'الأكثر شعبية للمهنيين', '["جميع ميزات الخطة الأساسية", "استراتيجية بحث عن عمل"]', true),
('premium', 'المتميزة', 75, 'JOD', '3 أشهر', 'للمهنيين الطموحين', '["جميع ميزات الخطة المهنية", "تطوير مهارات مخصص"]', true);
*/