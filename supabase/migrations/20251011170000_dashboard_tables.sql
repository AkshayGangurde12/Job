-- Create resumes table for file management
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'processing', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One resume per user
);

-- Create job_settings table for user preferences
CREATE TABLE public.job_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'difficult')),
  question_count INTEGER DEFAULT 10 CHECK (question_count >= 6 AND question_count <= 15),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create activity_history table for user actions
CREATE TABLE public.activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for resumes table
CREATE POLICY "Users can view their own resumes" 
ON public.resumes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" 
ON public.resumes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
ON public.resumes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
ON public.resumes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for job_settings table
CREATE POLICY "Users can view their own job settings" 
ON public.job_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job settings" 
ON public.job_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job settings" 
ON public.job_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for activity_history table
CREATE POLICY "Users can view their own activity history" 
ON public.activity_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity history" 
ON public.activity_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$;

-- Add updated_at triggers
CREATE TRIGGER handle_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_job_settings_updated_at
  BEFORE UPDATE ON public.job_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update existing profiles table trigger
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  activity_type TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  INSERT INTO public.activity_history (user_id, activity_type, description, metadata)
  VALUES (auth.uid(), activity_type, description, metadata);
END;
$;

-- Function to initialize user settings on first login
CREATE OR REPLACE FUNCTION public.initialize_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $
BEGIN
  -- Create default job settings
  INSERT INTO public.job_settings (user_id, difficulty_level, question_count)
  VALUES (NEW.id, 'medium', 10)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log initial activity
  INSERT INTO public.activity_history (user_id, activity_type, description)
  VALUES (NEW.id, 'account_created', 'User account created');
  
  RETURN NEW;
END;
$;

-- Update the existing trigger to also initialize settings
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    new.email
  );
  
  -- Initialize settings
  INSERT INTO public.job_settings (user_id, difficulty_level, question_count)
  VALUES (new.id, 'medium', 10);
  
  -- Log activity
  INSERT INTO public.activity_history (user_id, activity_type, description)
  VALUES (new.id, 'account_created', 'User account created');
  
  RETURN new;
END;
$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();