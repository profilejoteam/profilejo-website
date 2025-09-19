-- MANUAL FIX FOR ADMIN TABLE INFINITE RECURSION
-- Copy and paste this SQL into your Supabase SQL Editor and run it

-- 1. First, disable RLS temporarily to fix the issue
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies on admins table
DROP POLICY IF EXISTS "Admins can manage admins" ON admins;
DROP POLICY IF EXISTS "Users can read admins" ON admins;
DROP POLICY IF EXISTS "Only admins can modify admins" ON admins;
DROP POLICY IF EXISTS "Only admins can update admins" ON admins;
DROP POLICY IF EXISTS "Only admins can delete admins" ON admins;

-- 3. Insert the first admin if not exists
INSERT INTO admins (email, is_active, created_at)
VALUES ('amrabdullah19876@gmail.com', true, NOW())
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- 4. Re-enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 5. Create new non-recursive policies
CREATE POLICY "Allow authenticated users to read admins" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

-- 6. Create a function to check if current user is admin without recursion
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_email TEXT;
    is_admin_user BOOLEAN := false;
BEGIN
    -- Get current user's email
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
    -- Check if user is admin by direct email lookup (bypassing RLS)
    SELECT set_config('row_security', 'off', true);
    
    SELECT EXISTS(
        SELECT 1 FROM admins 
        WHERE email = user_email AND is_active = true
    ) INTO is_admin_user;
    
    SELECT set_config('row_security', 'on', true);
    
    RETURN is_admin_user;
EXCEPTION
    WHEN OTHERS THEN
        -- Reset row security in case of error
        SELECT set_config('row_security', 'on', true);
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create policies that use the function
CREATE POLICY "Allow admins to insert" ON admins
  FOR INSERT WITH CHECK (current_user_is_admin() OR NOT EXISTS (SELECT 1 FROM admins WHERE is_active = true));

CREATE POLICY "Allow admins to update" ON admins
  FOR UPDATE USING (current_user_is_admin());

CREATE POLICY "Allow admins to delete" ON admins
  FOR DELETE USING (current_user_is_admin());

-- 8. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION current_user_is_admin() TO authenticated;

-- Verification queries (run these to check if fix worked):
-- SELECT * FROM admins;
-- SELECT current_user_is_admin();