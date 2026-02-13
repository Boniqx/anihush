-- Add tags column to companions
ALTER TABLE public.companions ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Seed tags for existing companions
UPDATE public.companions SET tags = ARRAY['Action', 'Comedy', 'Shounen'] WHERE name = 'Satoru Gojo';
UPDATE public.companions SET tags = ARRAY['Action', 'Romance', 'Slice of Life'] WHERE name = 'Yor Forger';
UPDATE public.companions SET tags = ARRAY['Action', 'Shounen', 'Rivalry'] WHERE name = 'Katsuki Bakugo';
UPDATE public.companions SET tags = ARRAY['Action', 'Dark', 'Military'] WHERE name = 'Levi Ackerman';
UPDATE public.companions SET tags = ARRAY['Action', 'Dark', 'Comedy'] WHERE name = 'Power';
UPDATE public.companions SET tags = ARRAY['Dark', 'Psychological', 'Mystery'] WHERE name = 'Makima';
UPDATE public.companions SET tags = ARRAY['Action', 'Romance', 'Slice of Life'] WHERE name = 'Loid Forger';
UPDATE public.companions SET tags = ARRAY['Action', 'Dark', 'Military'] WHERE name = 'Mikasa Ackerman';
UPDATE public.companions SET tags = ARRAY['Romance', 'Mecha', 'Drama'] WHERE name = 'Zero Two';
UPDATE public.companions SET tags = ARRAY['Fantasy', 'Adventure', 'Slice of Life'] WHERE name = 'Frieren';

-- Create index on tags for search performance
CREATE INDEX IF NOT EXISTS idx_companions_tags ON public.companions USING GIN (tags);
