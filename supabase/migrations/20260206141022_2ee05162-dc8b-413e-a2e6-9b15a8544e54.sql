-- First migration: Add enum values and columns only
-- Add super_admin to staff_role enum
ALTER TYPE public.staff_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Create staff status enum
CREATE TYPE public.staff_status AS ENUM ('pending', 'approved', 'blocked');

-- Add status and school_position columns to staff_members
ALTER TABLE public.staff_members 
ADD COLUMN IF NOT EXISTS status public.staff_status DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS school_position text;

-- Create content/posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;