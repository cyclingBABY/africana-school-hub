-- ============================================================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Africana Muslim Secondary School Hub
-- ============================================================================
-- Run this entire script in your Supabase SQL Editor to set up the database
-- Dashboard: https://supabase.com/dashboard/project/ptyzvwrorfybhbyhebre/sql
-- ============================================================================

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');

-- Create enum for staff roles
CREATE TYPE public.staff_role AS ENUM ('admin', 'staff', 'super_admin');

-- Create staff status enum
CREATE TYPE public.staff_status AS ENUM ('pending', 'approved', 'blocked');

-- Create content type enum
CREATE TYPE public.content_type AS ENUM ('news', 'photo', 'video', 'announcement');

-- Create content category enum for slider/page assignment
CREATE TYPE public.content_category AS ENUM (
  'school_trip',
  'sports',
  'students',
  'gallery',
  'general',
  'hero',
  'features'
);

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
  status staff_status DEFAULT 'approved',
  school_position TEXT,
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

-- Create content/posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  content_type content_type DEFAULT 'news',
  category content_category DEFAULT 'general',
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  author_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_media table for media management
CREATE TABLE public.site_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create media_files table for tracking uploaded files
CREATE TABLE public.media_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.staff_members(id) ON DELETE SET NULL
);

-- Enable RLS on all tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Helper functions
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
CREATE POLICY "Public can submit new applications"
  ON public.applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending' AND
    reviewed_by IS NULL AND
    reviewed_at IS NULL AND
    admin_notes IS NULL
  );

CREATE POLICY "Staff can view all applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

CREATE POLICY "Staff can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- RLS Policies for staff_members
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

CREATE POLICY "Staff can view staff members"
  ON public.staff_members FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

CREATE POLICY "Admins can update staff members"
  ON public.staff_members FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

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

-- RLS policies for posts
CREATE POLICY "Super admin full access to posts"
ON public.posts
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Staff can view published posts"
ON public.posts
FOR SELECT
USING (is_approved_staff() AND is_published = true);

CREATE POLICY "Staff can view own posts"
ON public.posts
FOR SELECT
USING (is_approved_staff() AND author_id = get_staff_id());

CREATE POLICY "Staff can create posts"
ON public.posts
FOR INSERT
WITH CHECK (is_approved_staff() AND author_id = get_staff_id());

CREATE POLICY "Staff can update own posts"
ON public.posts
FOR UPDATE
USING (is_approved_staff() AND author_id = get_staff_id())
WITH CHECK (is_approved_staff() AND author_id = get_staff_id());

CREATE POLICY "Staff can delete own posts"
ON public.posts
FOR DELETE
USING (is_approved_staff() AND author_id = get_staff_id());

CREATE POLICY "Public can view published posts"
ON public.posts
FOR SELECT
USING (is_published = true);

-- RLS Policies for site_media
CREATE POLICY "Public can view site media"
ON public.site_media
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Staff can manage site media"
ON public.site_media
FOR ALL
TO authenticated
USING (is_approved_staff())
WITH CHECK (is_approved_staff());

-- RLS Policies for media_files
CREATE POLICY "Super admin full access to media_files"
ON public.media_files
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Staff can view all media files"
ON public.media_files
FOR SELECT
USING (public.is_approved_staff());

CREATE POLICY "Staff can insert media files"
ON public.media_files
FOR INSERT
WITH CHECK (
  public.is_approved_staff() AND
  created_by = public.get_staff_id()
);

CREATE POLICY "Staff can delete own media files"
ON public.media_files
FOR DELETE
USING (
  public.is_approved_staff() AND
  created_by = public.get_staff_id()
);

CREATE POLICY "Public can view media files"
ON public.media_files
FOR SELECT
USING (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('application-documents', 'application-documents', false, 10485760)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-media',
  'content-media',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
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

-- Storage policies for content-media bucket
CREATE POLICY "Authenticated staff can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-media' AND
  (public.is_approved_staff() OR public.is_super_admin())
);

CREATE POLICY "Authenticated staff can view media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'content-media' AND
  (public.is_approved_staff() OR public.is_super_admin())
);

CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'content-media');

CREATE POLICY "Staff can delete own media, super admin can delete all"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'content-media' AND
  (
    public.is_super_admin() OR
    (public.is_approved_staff() AND auth.uid() IN (
      SELECT user_id FROM public.staff_members WHERE id IN (
        SELECT created_by FROM public.media_files WHERE file_url = name
      )
    ))
  )
);

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

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_media_updated_at
BEFORE UPDATE ON public.site_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON public.posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON public.posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_display_order ON public.posts(display_order);
CREATE INDEX IF NOT EXISTS idx_media_files_post_id ON public.media_files(post_id);
CREATE INDEX IF NOT EXISTS idx_site_media_category ON public.site_media(category);
CREATE INDEX IF NOT EXISTS idx_site_media_file_type ON public.site_media(file_type);

-- Functions for content management
CREATE OR REPLACE FUNCTION public.get_published_content_by_category(
  p_category public.content_category,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  content_type public.content_type,
  category public.content_category,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.title,
    p.content,
    p.image_url,
    p.video_url,
    p.content_type,
    p.category,
    p.display_order,
    p.created_at,
    sm.full_name as author_name
  FROM public.posts p
  LEFT JOIN public.staff_members sm ON p.author_id = sm.id
  WHERE p.is_published = true
    AND p.category = p_category
  ORDER BY p.display_order ASC, p.created_at DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.get_all_published_content(
  p_content_type public.content_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  content_type public.content_type,
  category public.content_category,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.title,
    p.content,
    p.image_url,
    p.video_url,
    p.content_type,
    p.category,
    p.display_order,
    p.created_at,
    sm.full_name as author_name
  FROM public.posts p
  LEFT JOIN public.staff_members sm ON p.author_id = sm.id
  WHERE p.is_published = true
    AND (p_content_type IS NULL OR p.content_type = p_content_type)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- Comments for documentation
COMMENT ON TABLE public.applications IS 'Student admission applications with all required information';
COMMENT ON TABLE public.staff_members IS 'School staff members with role-based access control';
COMMENT ON TABLE public.application_notes IS 'Internal notes and comments on applications';
COMMENT ON TABLE public.posts IS 'Enhanced content management table supporting news, photos, videos, and announcements';
COMMENT ON TABLE public.site_media IS 'Media files for website sliders and galleries';
COMMENT ON TABLE public.media_files IS 'Tracks uploaded media files associated with posts';
COMMENT ON COLUMN public.posts.content_type IS 'Type of content: news, photo, video, or announcement';
COMMENT ON COLUMN public.posts.category IS 'Category for slider/page assignment';
COMMENT ON COLUMN public.posts.display_order IS 'Order for displaying in sliders (lower numbers appear first)';
COMMENT ON COLUMN public.posts.metadata IS 'Additional metadata in JSON format';
<parameter name="filePath">c:\Users\cod5_1\Desktop\africana-school-hub\complete-database-setup.sql