-- TravelSnap — Production PostgreSQL Schema
-- Run this in the Supabase SQL Editor

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Destinations
CREATE TABLE IF NOT EXISTS destinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_visited BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Places of Interest
CREATE TABLE IF NOT EXISTS places_of_interest (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    destination_id UUID REFERENCES destinations ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    note TEXT,
    is_completed BOOLEAN DEFAULT false NOT NULL
);

-- 4. Destination Photos
CREATE TABLE IF NOT EXISTS destination_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    destination_id UUID REFERENCES destinations ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    storage_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_of_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_photos ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Destinations policies
CREATE POLICY "Users can view own destinations"
    ON destinations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own destinations"
    ON destinations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own destinations"
    ON destinations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own destinations"
    ON destinations FOR DELETE
    USING (auth.uid() = user_id);

-- Places of interest policies
CREATE POLICY "Users can view own POIs"
    ON places_of_interest FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own POIs"
    ON places_of_interest FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own POIs"
    ON places_of_interest FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own POIs"
    ON places_of_interest FOR DELETE
    USING (auth.uid() = user_id);

-- Destination photos policies
CREATE POLICY "Users can view own photos"
    ON destination_photos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
    ON destination_photos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
    ON destination_photos FOR DELETE
    USING (auth.uid() = user_id);

-- Storage bucket for destination photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('destination-photos', 'destination-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'destination-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view destination photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'destination-photos');

CREATE POLICY "Users can delete own photos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'destination-photos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
