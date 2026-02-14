-- Add is_premium column to stories table
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Insert 3 Stories for Gojo
WITH gojo AS (
    SELECT id FROM public.companions WHERE name LIKE '%Gojo%' LIMIT 1
)
INSERT INTO public.stories (companion_id, media_url, media_type, duration, order_index, is_premium) 
SELECT 
    gojo.id,
    media_url,
    media_type,
    duration,
    order_index,
    is_premium
FROM gojo, (VALUES
    ('https://placehold.co/400x700/000000/FFFFFF?text=Yo,+I''m+Gojo.', 'image', 5, 0, false),
    ('https://placehold.co/400x700/000000/FFFFFF?text=Domain+Expansion...', 'image', 5, 1, false),
    ('https://placehold.co/400x700/000000/FF0000?text=Top+Secret+Technique', 'image', 5, 2, true)
) AS stories(media_url, media_type, duration, order_index, is_premium)
WHERE EXISTS (SELECT 1 FROM gojo);

-- Insert 2 Stories for Zero Two
WITH zerotwo AS (
    SELECT id FROM public.companions WHERE name = 'Zero Two' LIMIT 1
)
INSERT INTO public.stories (companion_id, media_url, media_type, duration, order_index, is_premium) 
SELECT 
    zerotwo.id,
    media_url,
    media_type,
    duration,
    order_index,
    is_premium
FROM zerotwo, (VALUES
    ('https://placehold.co/400x700/FF7E27/1A1A1A?text=Darling,+feed+me!', 'image', 5, 2, false),
    ('https://placehold.co/400x700/FF7E27/1A1A1A?text=I+found+something+sweet.', 'image', 5, 3, false)
) AS stories(media_url, media_type, duration, order_index, is_premium)
WHERE EXISTS (SELECT 1 FROM zerotwo);
