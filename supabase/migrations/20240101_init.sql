-- Anikama Database Schema
-- Migration: Initial Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- 2. Companions Table
CREATE TABLE IF NOT EXISTS public.companions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    anime_source TEXT NOT NULL,
    archetype TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    personality_traits TEXT[],
    system_prompt TEXT NOT NULL,
    mood TEXT DEFAULT 'neutral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Stories Table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    companion_id UUID REFERENCES public.companions(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    duration INTEGER DEFAULT 5,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Affinity Table (Nakama System)
CREATE TABLE IF NOT EXISTS public.user_affinity (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    companion_id UUID REFERENCES public.companions(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, companion_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_companion ON public.stories(companion_id);
CREATE INDEX IF NOT EXISTS idx_affinity_user ON public.user_affinity(user_id);
CREATE INDEX IF NOT EXISTS idx_affinity_companion ON public.user_affinity(companion_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_affinity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- RLS Policies for companions (public read)
CREATE POLICY "Anyone can view companions" 
    ON public.companions FOR SELECT 
    TO public 
    USING (true);

-- RLS Policies for stories (public read)
CREATE POLICY "Anyone can view stories" 
    ON public.stories FOR SELECT 
    TO public 
    USING (true);

-- RLS Policies for user_affinity
CREATE POLICY "Users can view their own affinity" 
    ON public.user_affinity FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own affinity" 
    ON public.user_affinity FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affinity" 
    ON public.user_affinity FOR UPDATE 
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
