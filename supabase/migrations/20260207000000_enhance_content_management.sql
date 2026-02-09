-- Enhanced Content Management System Migration
-- This migration adds support for media uploads, content categorization, and slider/page assignments

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

-- Add new columns to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS content_type public.content_type DEFAULT 'news',
ADD COLUMN IF NOT EXISTS category public.content_category DEFAULT 'general',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create media_files table for tracking uploaded files
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image/jpeg, video/mp4, etc.
  file_size BIGINT, -- in bytes
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.staff_members(id) ON DELETE SET NULL
);

-- Enable RLS on media_files
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for content media (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-media',
  'content-media',
  true,
  52428800, -- 50MB limit
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

-- Storage policies for content-media bucket
-- Allow authenticated staff to upload
CREATE POLICY "Authenticated staff can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content-media' AND
  (public.is_approved_staff() OR public.is_super_admin())
);

-- Allow authenticated staff to view media
CREATE POLICY "Authenticated staff can view media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'content-media' AND
  (public.is_approved_staff() OR public.is_super_admin())
);

-- Allow public to view media (for website display)
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'content-media');

-- Allow staff to delete their own uploads, super admin can delete all
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

-- RLS Policies for media_files table
-- Super admin can do everything
CREATE POLICY "Super admin full access to media_files"
ON public.media_files
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Staff can view all media files
CREATE POLICY "Staff can view all media files"
ON public.media_files
FOR SELECT
USING (public.is_approved_staff());

-- Staff can insert media files
CREATE POLICY "Staff can insert media files"
ON public.media_files
FOR INSERT
WITH CHECK (
  public.is_approved_staff() AND
  created_by = public.get_staff_id()
);

-- Staff can delete their own media files
CREATE POLICY "Staff can delete own media files"
ON public.media_files
FOR DELETE
USING (
  public.is_approved_staff() AND
  created_by = public.get_staff_id()
);

-- Public can view media files (for website display)
CREATE POLICY "Public can view media files"
ON public.media_files
FOR SELECT
USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON public.posts(content_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_published ON public.posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_display_order ON public.posts(display_order);
CREATE INDEX IF NOT EXISTS idx_media_files_post_id ON public.media_files(post_id);

-- Create function to get published content by category
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

-- Create function to get all published content
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

-- Add comment to document the schema
COMMENT ON TABLE public.posts IS 'Enhanced content management table supporting news, photos, videos, and announcements with category assignments for sliders and pages';
COMMENT ON TABLE public.media_files IS 'Tracks uploaded media files associated with posts';
COMMENT ON COLUMN public.posts.content_type IS 'Type of content: news, photo, video, or announcement';
COMMENT ON COLUMN public.posts.category IS 'Category for slider/page assignment: school_trip, sports, students, gallery, general, hero, features';
COMMENT ON COLUMN public.posts.video_url IS 'URL for embedded videos (YouTube, Vimeo, etc.)';
COMMENT ON COLUMN public.posts.display_order IS 'Order for displaying in sliders (lower numbers appear first)';
COMMENT ON COLUMN public.posts.metadata IS 'Additional metadata in JSON format (dimensions, duration, etc.)';
