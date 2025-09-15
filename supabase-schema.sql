-- Drop existing table if it exists and recreate with new structure
DROP TABLE IF EXISTS profile_files;
DROP TABLE IF EXISTS profiles;

-- Create profiles table with comprehensive fields
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic required fields
  full_name VARCHAR(100) NOT NULL CHECK (char_length(full_name) >= 3),
  date_of_birth DATE NOT NULL,
  city VARCHAR(50) NOT NULL CHECK (char_length(city) >= 2),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  linkedin_url TEXT, -- جعل LinkedIn اختياري
  
  -- Education (JSON array)
  education JSONB NOT NULL DEFAULT '[]',
  
  -- Experience (JSON array)
  experience JSONB NOT NULL DEFAULT '[]',
  
  -- Projects/Portfolio (JSON array)
  projects JSONB DEFAULT '[]',
  
  -- Skills (JSON array)
  skills JSONB DEFAULT '[]',
  
  -- Languages (JSON array)
  languages JSONB DEFAULT '[]',
  
  -- Certifications (JSON array)
  certifications JSONB DEFAULT '[]',
  
  -- Additional fields for job matching
  preferred_roles JSONB DEFAULT '[]',
  preferred_industries JSONB DEFAULT '[]',
  availability_date DATE,
  desired_job_type VARCHAR(50),
  willing_to_relocate BOOLEAN DEFAULT false,
  expected_salary_range VARCHAR(100),
  remote_ok BOOLEAN DEFAULT false,
  
  -- File uploads
  photo_url TEXT,
  portfolio_files JSONB DEFAULT '[]',
  
  -- Legal agreements
  data_usage_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Status and metadata
  status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, approved, etc.
  submission_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see and modify their own data
CREATE POLICY "Users can view their own profiles" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX profiles_user_id_idx ON profiles(user_id);
CREATE INDEX profiles_created_at_idx ON profiles(created_at);
CREATE INDEX profiles_status_idx ON profiles(status);
CREATE INDEX profiles_city_idx ON profiles(city);
CREATE INDEX profiles_availability_idx ON profiles(availability_date);

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create table for file uploads
CREATE TABLE profile_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'photo', 'diploma', 'certificate', 'portfolio', etc.
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for files table
ALTER TABLE profile_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own files" ON profile_files
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for files table
CREATE INDEX profile_files_profile_id_idx ON profile_files(profile_id);
CREATE INDEX profile_files_user_id_idx ON profile_files(user_id);
CREATE INDEX profile_files_type_idx ON profile_files(file_type);
