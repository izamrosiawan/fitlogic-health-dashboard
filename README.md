# FitLogic - Health & Fitness Tracker

FitLogic is a premium, full-stack fitness and health tracking web application tailored for students and young adults. Designed with a dark mode aesthetic inspired by Apple Fitness and Strava, FitLogic allows users to log workouts, calculate BMI, configure daily calorie goals with activity multipliers, and visualize progress with interactive charts.

---

## 🚀 Key Features

1. **Secure Authentication**: Register, Sign In, and Reset Passwords via Supabase Auth (with protected route guards under `/dashboard`).
2. **BMI Profile Tracker**: Calculate body mass indexes in Metric (cm, kg) or Imperial (in, lbs) units. Automatically categorizes results and maintains a detailed history table.
3. **Calorie Needs Calculator**: Computes Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor equation. Stores configuration targets.
4. **Workout Logger**: Log activities with customizable durations, dates, and active energy burn metrics (kcal). Supported by total aggregate widgets.
5. **Interactive Charts**: Responsive analytics displaying bodyweight trends, daily workout energy outputs, and historical caloric budget updates using Recharts.

---

## 🛠️ Tech Stack & Libraries

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS & shadcn/ui (Base-UI Preset)
- **Database & Authentication**: Supabase (PostgreSQL with RLS policy isolation)
- **Animations**: Framer Motion
- **Visual Charts**: Recharts Library
- **State & Form Validation**: React Hook Form, Zod schema validation, Sonner notifications

---

## ⚙️ Project Setup

### 1. Configure Supabase Database Schema

1. Log into your [Supabase Console](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) and run the script. This creates:
   - `profiles`, `bmi_records`, `calorie_records`, and `workouts` tables.
   - Enables Row Level Security (RLS) policies to isolate user records.
   - Attaches a database trigger that automatically generates a user profile record in `public.profiles` whenever a new user signs up.
4. To populate charts immediately with demo data for manual testing, open [`supabase/seed.sql`](./supabase/seed.sql), replace the placeholder user UUID with your actual user UUID (from the Supabase auth table), and run it.

### 2. Configure Environment Variables

Create a file named `.env.local` in the root of the project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anonymous-api-key
```

### 3. Local Development Installation

Install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page!

---

## 🧬 Code Architecture

- `src/app/page.tsx`: Premium marketing landing page.
- `src/app/login/`, `/register/`, `/forgot-password/`: Authentication screens using Supabase Auth.
- `src/app/dashboard/`: Main layouts and pages.
- `src/components/layout/`: Global Shell components (Sidebar, Header, PageContainer).
- `src/components/dashboard/`: Individual analytics and BMI/Calorie widgets.
- `src/utils/supabase/`: Client and Server SSR supabase connections.
- `src/middleware.ts`: Middleware ensuring all paths under `/dashboard` check session cookies.

---

## 🔒 Security & Row Level Security (RLS)

All database tables have Row Level Security enabled. This ensures that:
- Users can ONLY select/insert/update/delete records where `auth.uid() = user_id`.
- Profile details are synced safely with database-level triggers.
- Cloud sessions are stored as HTTP-only cookies and refreshed automatically by Next.js middleware.
