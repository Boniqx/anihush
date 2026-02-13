-- Insert 2 Stories for Zero Two
WITH zerotwo AS (
    SELECT id FROM public.companions WHERE name = 'Zero Two' LIMIT 1
)
INSERT INTO public.stories (companion_id, media_url, media_type, duration, order_index) 
SELECT 
    zerotwo.id,
    media_url,
    media_type,
    duration,
    order_index
FROM zerotwo, (VALUES
    ('https://placehold.co/400x700/FF7E27/1A1A1A?text=Darling,+look+at+me!', 'image', 5, 0),
    ('https://placehold.co/400x700/FF7E27/1A1A1A?text=Let''s+run+away+together!', 'image', 5, 1)
) AS stories(media_url, media_type, duration, order_index)
WHERE EXISTS (SELECT 1 FROM zerotwo);
