-- Seed data for testing FitLogic health dashboard.
-- Note: Change '00000000-0000-0000-0000-000000000000' to your actual Supabase auth user UUID.

-- 1. Insert mock profile if not exists
INSERT INTO public.profiles (id, email, full_name, height, weight, target_weight, target_calories)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'demo@fitlogic.com',
    'Alex Carter',
    178.0,
    78.5,
    72.0,
    2200
)
ON CONFLICT (id) DO UPDATE 
SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    height = EXCLUDED.height,
    weight = EXCLUDED.weight,
    target_weight = EXCLUDED.target_weight,
    target_calories = EXCLUDED.target_calories;

-- 2. Insert mock BMI history records
INSERT INTO public.bmi_records (user_id, height, weight, bmi, category, recorded_at)
VALUES
    ('00000000-0000-0000-0000-000000000000', 178.0, 84.0, 26.5, 'Overweight', now() - interval '3 months'),
    ('00000000-0000-0000-0000-000000000000', 178.0, 82.5, 26.0, 'Overweight', now() - interval '2 months'),
    ('00000000-0000-0000-0000-000000000000', 178.0, 80.2, 25.3, 'Overweight', now() - interval '1 month'),
    ('00000000-0000-0000-0000-000000000000', 178.0, 78.5, 24.8, 'Normal weight', now() - interval '1 week');

-- 3. Insert mock daily calorie needs calculations
INSERT INTO public.calorie_records (user_id, age, gender, height, weight, activity_level, goal, bmr, tdee, target_calories, recorded_at)
VALUES
    ('00000000-0000-0000-0000-000000000000', 21, 'male', 178.0, 84.0, 'moderate', 'lose_slow', 1820, 2502, 2252, now() - interval '3 months'),
    ('00000000-0000-0000-0000-000000000000', 21, 'male', 178.0, 82.5, 'moderate', 'lose_slow', 1800, 2475, 2225, now() - interval '2 months'),
    ('00000000-0000-0000-0000-000000000000', 21, 'male', 178.0, 80.2, 'moderate', 'lose_fast', 1768, 2431, 1931, now() - interval '1 month'),
    ('00000000-0000-0000-0000-000000000000', 21, 'male', 178.0, 78.5, 'active', 'maintain', 1745, 2704, 2704, now() - interval '1 week');

-- 4. Insert mock workouts
INSERT INTO public.workouts (user_id, name, duration, calories_burned, date, notes)
VALUES
    ('00000000-0000-0000-0000-000000000000', 'Morning Run', 45, 520, CURRENT_DATE - 6, 'Feeling good, ran around campus'),
    ('00000000-0000-0000-0000-000000000000', 'Push Day Gym Session', 60, 420, CURRENT_DATE - 5, 'Heavy bench and shoulder press'),
    ('00000000-0000-0000-0000-000000000000', 'HIIT Cardio', 30, 380, CURRENT_DATE - 4, 'High intensity intervals on treadmill'),
    ('00000000-0000-0000-0000-000000000000', 'Pull Day Gym Session', 60, 400, CURRENT_DATE - 3, 'Focus on deadlifts and rows'),
    ('00000000-0000-0000-0000-000000000000', 'Evening Cycling', 50, 480, CURRENT_DATE - 2, 'Rode along the park pathway'),
    ('00000000-0000-0000-0000-000000000000', 'Leg Day Gym Session', 70, 550, CURRENT_DATE - 1, 'Squats, leg press, lunges'),
    ('00000000-0000-0000-0000-000000000000', 'Swimming', 40, 450, CURRENT_DATE, 'Active recovery swimming laps');
