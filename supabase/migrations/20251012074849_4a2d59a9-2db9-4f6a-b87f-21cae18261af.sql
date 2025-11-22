-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add resume columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS resume TEXT,
ADD COLUMN IF NOT EXISTS resume_file_url TEXT;

-- Create interviews table to store interview sessions
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'difficult')),
  num_questions INTEGER NOT NULL CHECK (num_questions >= 6 AND num_questions <= 15),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on interviews table
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for interviews table
CREATE POLICY "Users can view their own interviews"
ON public.interviews
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interviews"
ON public.interviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews"
ON public.interviews
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interviews"
ON public.interviews
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp for interviews
CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON public.interviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at timestamp for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();