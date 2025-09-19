-- Fix for infinite recursion in admins table RLS policy
-- This script fixes the circular dependency in the admins table policy

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage admins" ON admins;

-- Create a simple policy that allows authenticated users to read admins
-- but only allows admins to modify the table
CREATE POLICY "Users can read admins" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a separate policy for insert/update/delete that uses a function
-- to check admin status without circular dependency
CREATE POLICY "Only admins can modify admins" ON admins
  FOR INSERT WITH CHECK (
    -- Allow first admin to be created when table is empty
    NOT EXISTS (SELECT 1 FROM admins WHERE is_active = true)
    OR
    -- Check if current user's email exists in admins table
    EXISTS (
      SELECT 1 FROM admins a
      JOIN auth.users u ON a.user_id = u.id
      WHERE u.id = auth.uid() AND a.is_active = true
    )
  );

CREATE POLICY "Only admins can update admins" ON admins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN auth.users u ON a.user_id = u.id
      WHERE u.id = auth.uid() AND a.is_active = true
    )
  );

CREATE POLICY "Only admins can delete admins" ON admins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admins a
      JOIN auth.users u ON a.user_id = u.id
      WHERE u.id = auth.uid() AND a.is_active = true
    )
  );

-- Also update the is_admin function to be more efficient and avoid recursion
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    check_email TEXT;
    result BOOLEAN := false;
BEGIN
    -- Use provided email or current user's email
    IF user_email IS NULL THEN
        SELECT email INTO check_email FROM auth.users WHERE id = auth.uid();
    ELSE
        check_email := user_email;
    END IF;
    
    -- Check if email exists in admins table and is active
    -- Use a direct query without RLS to avoid recursion
    PERFORM set_config('row_security', 'off', true);
    
    SELECT EXISTS(
        SELECT 1 FROM admins 
        WHERE email = check_email AND is_active = true
    ) INTO result;
    
    PERFORM set_config('row_security', 'on', true);
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Reset row security in case of error
        PERFORM set_config('row_security', 'on', true);
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert first admin if table is empty
-- Replace 'amrabdullah19876@gmail.com' with your actual admin email
DO $$
BEGIN
    -- Only insert if no admins exist
    IF NOT EXISTS (SELECT 1 FROM admins WHERE is_active = true) THEN
        INSERT INTO admins (user_id, email, is_active, created_at)
        SELECT 
            id,
            'amrabdullah19876@gmail.com',
            true,
            NOW()
        FROM auth.users 
        WHERE email = 'amrabdullah19876@gmail.com'
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;