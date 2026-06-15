-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    height NUMERIC, -- in cm
    weight NUMERIC, -- in kg
    target_weight NUMERIC, -- in kg
    target_calories INTEGER,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create bmi_records table
CREATE TABLE public.bmi_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    height NUMERIC NOT NULL,
    weight NUMERIC NOT NULL,
    bmi NUMERIC NOT NULL,
    category TEXT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create calorie_records table
CREATE TABLE public.calorie_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    height NUMERIC NOT NULL,
    weight NUMERIC NOT NULL,
    activity_level TEXT NOT NULL,
    goal TEXT NOT NULL,
    bmr NUMERIC NOT NULL,
    tdee NUMERIC NOT NULL,
    target_calories INTEGER NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workouts table
CREATE TABLE public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    calories_burned INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bmi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calorie_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- BMI records policies
CREATE POLICY "Users can view own BMI records" 
    ON public.bmi_records FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own BMI records" 
    ON public.bmi_records FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own BMI records" 
    ON public.bmi_records FOR DELETE 
    USING (auth.uid() = user_id);

-- Calorie records policies
CREATE POLICY "Users can view own calorie records" 
    ON public.calorie_records FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calorie records" 
    ON public.calorie_records FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calorie records" 
    ON public.calorie_records FOR DELETE 
    USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" 
    ON public.workouts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" 
    ON public.workouts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" 
    ON public.workouts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" 
    ON public.workouts FOR DELETE 
    USING (auth.uid() = user_id);

-- Profile Sync Trigger (from auth.users to public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
    VALUES (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        coalesce(new.created_at, now()),
        coalesce(new.updated_at, now())
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
