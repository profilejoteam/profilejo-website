    -- Update existing profiles table to add missing columns and modify existing ones

    -- ===== ADMIN MANAGEMENT SYSTEM =====
    -- Create admins table for managing admin users
    CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN NOT NULL DEFAULT true
    );

    -- Enable RLS for admins table
    ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

    -- Create policy for admins table - only admins can manage admins
    CREATE POLICY "Admins can manage admins" ON admins
    FOR ALL USING (
        EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() AND is_active = true
        )
    );

    -- Function to check if user is admin
    CREATE OR REPLACE FUNCTION is_admin(user_email TEXT DEFAULT NULL)
    RETURNS BOOLEAN AS $$
    DECLARE
        check_email TEXT;
        result BOOLEAN;
    BEGIN
        -- Use provided email or current user's email
        IF user_email IS NULL THEN
            SELECT email INTO check_email FROM auth.users WHERE id = auth.uid();
        ELSE
            check_email := user_email;
        END IF;
        
        -- Check if email exists in admins table and is active
        SELECT EXISTS(
            SELECT 1 FROM admins 
            WHERE email = check_email AND is_active = true
        ) INTO result;
        
        RETURN result;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to add admin
    CREATE OR REPLACE FUNCTION add_admin(admin_email TEXT)
    RETURNS TEXT AS $$
    DECLARE
        target_user_id UUID;
        current_user_email TEXT;
    BEGIN
        -- Get current user email (must be admin to add others)
        SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
        
        -- Check if current user is admin (except for first admin)
        IF EXISTS(SELECT 1 FROM admins WHERE is_active = true) THEN
            IF NOT is_admin() THEN
                RETURN 'خطأ: ليس لديك صلاحيات إدارية';
            END IF;
        END IF;
        
        -- Get target user ID
        SELECT id INTO target_user_id FROM auth.users WHERE email = admin_email;
        
        IF target_user_id IS NULL THEN
            RETURN 'خطأ: المستخدم غير موجود: ' || admin_email;
        END IF;
        
        -- Check if already admin
        IF is_admin(admin_email) THEN
            RETURN 'المستخدم ' || admin_email || ' مدير بالفعل';
        END IF;
        
        -- Add as admin
        INSERT INTO admins (user_id, email, created_by)
        VALUES (target_user_id, admin_email, auth.uid());
        
        RETURN 'تم إضافة ' || admin_email || ' كمدير بنجاح';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to remove admin
    CREATE OR REPLACE FUNCTION remove_admin(admin_email TEXT)
    RETURNS TEXT AS $$
    BEGIN
        -- Check if current user is admin
        IF NOT is_admin() THEN
            RETURN 'خطأ: ليس لديك صلاحيات إدارية';
        END IF;
        
        -- Prevent removing yourself
        IF admin_email = (SELECT email FROM auth.users WHERE id = auth.uid()) THEN
            RETURN 'خطأ: لا يمكنك إزالة نفسك';
        END IF;
        
        -- Remove admin
        UPDATE admins 
        SET is_active = false 
        WHERE email = admin_email;
        
        IF FOUND THEN
            RETURN 'تم إزالة صلاحيات الإدارة من ' || admin_email;
        ELSE
            RETURN 'المستخدم ' || admin_email || ' ليس مديراً';
        END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to get all admins
    CREATE OR REPLACE FUNCTION get_all_admins()
    RETURNS TABLE(
        id UUID,
        user_id UUID, 
        email TEXT,
        created_at TIMESTAMPTZ,
        created_by_email TEXT,
        is_active BOOLEAN
    ) AS $$
    BEGIN
        -- Check if current user is admin
        IF NOT is_admin() THEN
            RAISE EXCEPTION 'ليس لديك صلاحيات إدارية';
        END IF;
        
        RETURN QUERY
        SELECT 
            a.id,
            a.user_id,
            a.email,
            a.created_at,
            cu.email as created_by_email,
            a.is_active
        FROM admins a
        LEFT JOIN auth.users cu ON a.created_by = cu.id
        WHERE a.is_active = true
        ORDER BY a.created_at DESC;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- ===== END ADMIN MANAGEMENT SYSTEM =====

    -- ===== PROFILES TABLE UPDATES =====
    -- Update existing profiles table to add missing columns and modify existing ones
    DO $$
    BEGIN
        -- Make LinkedIn URL nullable (remove NOT NULL constraint)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'profiles' AND column_name = 'linkedin_url' AND is_nullable = 'NO') THEN
            ALTER TABLE profiles ALTER COLUMN linkedin_url DROP NOT NULL;
        END IF;

        -- Check and add education column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'education') THEN
            ALTER TABLE profiles ADD COLUMN education JSONB NOT NULL DEFAULT '[]';
        END IF;
        
        -- Check and add experience column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'experience') THEN
            ALTER TABLE profiles ADD COLUMN experience JSONB NOT NULL DEFAULT '[]';
        END IF;
        
        -- Check and add projects column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'projects') THEN
            ALTER TABLE profiles ADD COLUMN projects JSONB DEFAULT '[]';
        END IF;
        
        -- Check and add skills column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'skills') THEN
            ALTER TABLE profiles ADD COLUMN skills JSONB DEFAULT '[]';
        END IF;
        
        -- Check and add languages column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'languages') THEN
            ALTER TABLE profiles ADD COLUMN languages JSONB DEFAULT '[]';
        END IF;
        
        -- Check and add certifications column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'certifications') THEN
            ALTER TABLE profiles ADD COLUMN certifications JSONB DEFAULT '[]';
        END IF;
        
        -- Check and add preferred_roles column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'preferred_roles') THEN
            ALTER TABLE profiles ADD COLUMN preferred_roles JSONB DEFAULT '[]';
        END IF;
        
        -- Check and add preferred_industries column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'preferred_industries') THEN
            ALTER TABLE profiles ADD COLUMN preferred_industries JSONB DEFAULT '[]';
        END IF;
        
        -- Check and add availability_date column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'availability_date') THEN
            ALTER TABLE profiles ADD COLUMN availability_date DATE;
        END IF;
        
        -- Check and add desired_job_type column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'desired_job_type') THEN
            ALTER TABLE profiles ADD COLUMN desired_job_type VARCHAR(50);
        END IF;
        
        -- Check and add willing_to_relocate column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'willing_to_relocate') THEN
            ALTER TABLE profiles ADD COLUMN willing_to_relocate BOOLEAN DEFAULT false;
        END IF;
        
        -- Check and add expected_salary_range column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'expected_salary_range') THEN
            ALTER TABLE profiles ADD COLUMN expected_salary_range VARCHAR(100);
        END IF;
        
        -- Check and add remote_ok column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'remote_ok') THEN
            ALTER TABLE profiles ADD COLUMN remote_ok BOOLEAN DEFAULT false;
        END IF;
        
        -- Check and add photo_url column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'photo_url') THEN
            ALTER TABLE profiles ADD COLUMN photo_url TEXT;
        END IF;
        
        -- Check and add portfolio_files column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'portfolio_files') THEN
            ALTER TABLE profiles ADD COLUMN portfolio_files JSONB DEFAULT '[]';
        END IF;
        
        -- Check and add data_usage_consent column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'data_usage_consent') THEN
            ALTER TABLE profiles ADD COLUMN data_usage_consent BOOLEAN NOT NULL DEFAULT false;
        END IF;
        
        -- Check and add marketing_consent column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'marketing_consent') THEN
            ALTER TABLE profiles ADD COLUMN marketing_consent BOOLEAN DEFAULT false;
        END IF;
        
        -- Check and add status column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'status') THEN
            ALTER TABLE profiles ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
        END IF;
        
        -- Check and add submission_date column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'submission_date') THEN
            ALTER TABLE profiles ADD COLUMN submission_date TIMESTAMP WITH TIME ZONE;
        END IF;
        
        -- Check and add updated_at column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
            ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
    END $$;

    -- Enable Row Level Security (RLS) if not already enabled
    DO $$
    BEGIN
        IF NOT (SELECT pg_catalog.pg_get_userbyid(relowner) FROM pg_class WHERE relname = 'profiles' AND relkind = 'r') IS NULL THEN
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        END IF;
    END $$;

    -- Create policies if they don't exist
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profiles') THEN
            CREATE POLICY "Users can view their own profiles" ON profiles
            FOR SELECT USING (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profiles') THEN
            CREATE POLICY "Users can insert their own profiles" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profiles') THEN
            CREATE POLICY "Users can update their own profiles" ON profiles
            FOR UPDATE USING (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can delete their own profiles') THEN
            CREATE POLICY "Users can delete their own profiles" ON profiles
            FOR DELETE USING (auth.uid() = user_id);
        END IF;
    END $$;

    -- Create indexes if they don't exist
    CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);
    CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);
    CREATE INDEX IF NOT EXISTS profiles_city_idx ON profiles(city);
    CREATE INDEX IF NOT EXISTS profiles_availability_idx ON profiles(availability_date);

    -- Create or replace the update function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Drop trigger if exists and recreate
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON profiles 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Create profile_files table if it doesn't exist
    CREATE TABLE IF NOT EXISTS profile_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS for files table
    ALTER TABLE profile_files ENABLE ROW LEVEL SECURITY;

    -- Create policy for files if it doesn't exist
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_files' AND policyname = 'Users can manage their own files') THEN
            CREATE POLICY "Users can manage their own files" ON profile_files
            FOR ALL USING (auth.uid() = user_id);
        END IF;
    END $$;

    -- Create first admin user function
    CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT, admin_password TEXT)
    RETURNS TEXT AS $$
    DECLARE
        admin_user_id UUID;
    BEGIN
        -- This is a manual function to create admin users
        -- You need to call this manually after creating user in Supabase auth
        
        RETURN 'Please create user in Supabase auth first, then call set_user_as_admin(user_email)';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to set existing user as admin
    CREATE OR REPLACE FUNCTION set_user_as_admin(user_email TEXT)
    RETURNS TEXT AS $$
    DECLARE
        user_id UUID;
    BEGIN
        -- Get user ID from auth.users
        SELECT id INTO user_id 
        FROM auth.users 
        WHERE email = user_email;
        
        IF user_id IS NULL THEN
            RETURN 'User not found with email: ' || user_email;
        END IF;
        
        -- Update or insert profile with admin status
        INSERT INTO profiles (id, email, is_admin, created_at, updated_at)
        VALUES (user_id, user_email, true, NOW(), NOW())
        ON CONFLICT (id) 
        DO UPDATE SET 
            is_admin = true,
            updated_at = NOW();
        
        RETURN 'User ' || user_email || ' has been set as admin successfully';
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to remove admin status
    CREATE OR REPLACE FUNCTION remove_admin_status(user_email TEXT)
    RETURNS TEXT AS $$
    DECLARE
        user_id UUID;
    BEGIN
        -- Get user ID from auth.users
        SELECT id INTO user_id 
        FROM auth.users 
        WHERE email = user_email;
        
        IF user_id IS NULL THEN
            RETURN 'User not found with email: ' || user_email;
        END IF;
        
        -- Update profile to remove admin status
        UPDATE profiles 
        SET is_admin = false, updated_at = NOW()
        WHERE id = user_id;
        
        IF FOUND THEN
            RETURN 'Admin status removed for user: ' || user_email;
        ELSE
            RETURN 'User profile not found: ' || user_email;
        END IF;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create indexes for files table if they don't exist
    CREATE INDEX IF NOT EXISTS profile_files_profile_id_idx ON profile_files(profile_id);
    CREATE INDEX IF NOT EXISTS profile_files_user_id_idx ON profile_files(user_id);
    CREATE INDEX IF NOT EXISTS profile_files_type_idx ON profile_files(file_type);
