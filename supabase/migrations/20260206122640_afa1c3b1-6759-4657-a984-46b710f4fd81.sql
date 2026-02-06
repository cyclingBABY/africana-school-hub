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
-- Anyone can insert (public form submission)
CREATE POLICY "Anyone can submit applications"
  ON public.applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

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

-- Only admins can insert staff members
CREATE POLICY "Admins can add staff members"
  ON public.staff_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

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
VALUES ('application-documents', 'application-documents', false, 10485760);

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