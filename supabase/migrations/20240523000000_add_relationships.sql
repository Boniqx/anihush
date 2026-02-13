-- Add personality_type to companions table
ALTER TABLE public.companions 
ADD COLUMN IF NOT EXISTS personality_type text CHECK (personality_type IN ('Tsundere', 'Deredere', 'Kuudere', 'Ore-sama'));

-- Create relationships table
CREATE TABLE IF NOT EXISTS public.relationships (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    companion_id UUID REFERENCES public.companions(id) ON DELETE CASCADE,
    affinity_score INTEGER DEFAULT 0 CHECK (affinity_score >= -100 AND affinity_score <= 100),
    current_mood TEXT DEFAULT 'neutral' CHECK (current_mood IN ('neutral', 'happy', 'jealous', 'annoyed', 'flirty')),
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, companion_id)
);

-- Add RLS policies (optional but recommended)
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own relationships" 
ON public.relationships FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationships" 
ON public.relationships FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own relationships" 
ON public.relationships FOR INSERT 
WITH CHECK (auth.uid() = user_id);
