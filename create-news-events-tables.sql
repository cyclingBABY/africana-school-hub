-- Create Posts Table for News & Events
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_published ON public.posts(is_published);
CREATE INDEX idx_posts_created ON public.posts(created_at);
CREATE INDEX idx_posts_author ON public.posts(author_id);

-- RLS Policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access to posts" ON public.posts FOR ALL TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Approved staff can manage posts" ON public.posts FOR ALL TO authenticated
USING (public.is_approved_staff())
WITH CHECK (public.is_approved_staff());

-- Public read for published posts
CREATE POLICY "Public can read published posts" ON public.posts FOR SELECT TO anon
USING (is_published = true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE
ON public.posts FOR EACH ROW EXECUTE PROCEDURE update_posts_updated_at();

-- Insert sample data (optional - no author_id required)
INSERT INTO public.posts (title, content, is_published) VALUES
('Welcome to Africana School', 'Our school website is now live! Check out our admissions, fees, and requirements.', true)
ON CONFLICT DO NOTHING;

-- Verify
SELECT * FROM public.posts LIMIT 1;


-- Verify
SELECT 'Posts table ready!' as status;

