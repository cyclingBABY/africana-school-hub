-- ============================================================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Africana Muslim Secondary School Hub
-- ============================================================================
-- Run this entire script in your Supabase SQL Editor to set up the database
-- Dashboard: https://supabase.com/dashboard/project/tjlsziiovzcbekhstouc/sql
-- ============================================================================

-- MIGRATION 1: Initial Schema Setup
-- ============================================================================

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- Create enum for staff roles
CREATE TYPE public.staff_role AS ENUM ('admin', 'staff');

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status application_status NOT NULL DEFAULT 'pending',
  
  -- Student Information
  student_first_name TEXT NOT NULL,
  student_last_name TEXT NOT NULL,
  student_date_of_birth DATE NOT NULL,
  student_gender TEXT NOT NULL,
  student_religion TEXT,
  class_level TEXT NOT NULL,
  student_type TEXT NOT NULL, -- 'day' or 'boarding'
  
  -- Parent/Guardian Information
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_relationship TEXT NOT NULL,
  parent_address TEXT NOT NULL,
  parent_occupation TEXT,
  
  -- Previous School
  previous_school_name TEXT,
  previous_school_class TEXT,
  previous_school_leaving_reason TEXT,
  
  -- Emergency Contact
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,
  
  -- Document References (storage paths)
  birth_certificate_url TEXT,
  passport_photo_url TEXT,
  previous_results_url TEXT,
  
  -- Admin Notes
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create staff_members table for role management
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role staff_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create application_notes table for tracking
CREATE TABLE public.application_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is staff or admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE user_id = auth.uid()
  )
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Helper function to get current staff member id
CREATE OR REPLACE FUNCTION public.get_staff_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.staff_members
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- RLS Policies for applications
-- Only staff/admin can view applications
CREATE POLICY "Staff can view all applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

-- Only staff/admin can update applications
CREATE POLICY "Staff can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- RLS Policies for staff_members
-- Staff can view all staff members
CREATE POLICY "Staff can view staff members"
  ON public.staff_members FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

-- Only admins can update staff members
CREATE POLICY "Admins can update staff members"
  ON public.staff_members FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete staff members
CREATE POLICY "Admins can delete staff members"
  ON public.staff_members FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- RLS Policies for application_notes
CREATE POLICY "Staff can view notes"
  ON public.application_notes FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

CREATE POLICY "Staff can add notes"
  ON public.application_notes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff_or_admin() AND staff_id = public.get_staff_id());

-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('application-documents', 'application-documents', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for application documents
CREATE POLICY "Anyone can upload application documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'application-documents');

CREATE POLICY "Staff can view application documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'application-documents' AND public.is_staff_or_admin());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- MIGRATION 2: Update Application Policies
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;

-- Create a more specific policy - still allows public inserts but only for new pending applications
CREATE POLICY "Public can submit new applications"
  ON public.applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending' AND
    reviewed_by IS NULL AND
    reviewed_at IS NULL AND
    admin_notes IS NULL
  );

-- MIGRATION 3: Add Super Admin and Staff Status
-- ============================================================================

-- Add super_admin to staff_role enum
ALTER TYPE public.staff_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Create staff status enum
DO $$ BEGIN
  CREATE TYPE public.staff_status AS ENUM ('pending', 'approved', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status and school_position columns to staff_members
ALTER TABLE public.staff_members 
ADD COLUMN IF NOT EXISTS status public.staff_status DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS school_position text;

-- Create content/posts table
CREATE TABLE IF NOT EXISTS public.posts (
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

-- MIGRATION 4: Super Admin Functions and Policies
-- ============================================================================

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND status = 'approved'
  )
$$;

-- Create function to check if user is approved staff
CREATE OR REPLACE FUNCTION public.is_approved_staff()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE user_id = auth.uid()
      AND status = 'approved'
  )
$$;

-- RLS policies for posts
-- Super admin can do everything
CREATE POLICY "Super admin full access to posts"
ON public.posts
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Staff can view all published posts
CREATE POLICY "Staff can view published posts"
ON public.posts
FOR SELECT
USING (is_approved_staff() AND is_published = true);

-- Staff can view their own posts
CREATE POLICY "Staff can view own posts"
ON public.posts
FOR SELECT
USING (is_approved_staff() AND author_id = get_staff_id());

-- Staff can create posts
CREATE POLICY "Staff can create posts"
ON public.posts
FOR INSERT
WITH CHECK (is_approved_staff() AND author_id = get_staff_id());

-- Staff can update only their own posts
CREATE POLICY "Staff can update own posts"
ON public.posts
FOR UPDATE
USING (is_approved_staff() AND author_id = get_staff_id())
WITH CHECK (is_approved_staff() AND author_id = get_staff_id());

-- Staff can delete only their own posts
CREATE POLICY "Staff can delete own posts"
ON public.posts
FOR DELETE
USING (is_approved_staff() AND author_id = get_staff_id());

-- Public can view published posts
CREATE POLICY "Public can view published posts"
ON public.posts
FOR SELECT
USING (is_published = true);

-- Update staff_members RLS to allow pending registrations
DROP POLICY IF EXISTS "Admins can add staff members" ON public.staff_members;

CREATE POLICY "Users can register as pending staff"
ON public.staff_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND status = 'pending'
  AND role = 'staff'
);

CREATE POLICY "Super admin can manage all staff"
ON public.staff_members
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Update trigger for posts
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next Steps:
-- 1. Create the Super Admin user in Authentication > Users
--    Email: africanamuslim_code5_creations@gmail.com
--    Password: admin.africana.2026
-- 2. Verify all tables appear in the Table Editor
-- 3. Check that the storage bucket 'application-documents' exists
-- ============================================================================
