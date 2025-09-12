-- Update existing profiles table to add missing columns (if they don't exist)

-- Add missing columns one by one to avoid conflicts
DO $$ 
BEGIN
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

-- Create indexes for files table if they don't exist
CREATE INDEX IF NOT EXISTS profile_files_profile_id_idx ON profile_files(profile_id);
CREATE INDEX IF NOT EXISTS profile_files_user_id_idx ON profile_files(user_id);
CREATE INDEX IF NOT EXISTS profile_files_type_idx ON profile_files(file_type);
