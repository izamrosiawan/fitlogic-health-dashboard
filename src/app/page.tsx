"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Activity, Flame, Dumbbell, Scale, ChevronRight, TrendingUp, Sparkles, Shield, GraduationCap, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const handleTryDemo = () => {
    if (typeof window === 'undefined') return
    const user = {
      id: 'demo-user-id',
      email: 'guest@fitlogic.com',
      user_metadata: { full_name: 'Guest Student' }
    }
    localStorage.setItem('fitlogic_user', JSON.stringify(user))
    document.cookie = "fitlogic_user=true; path=/"
    
    // Inject mock seed data if not present
    if (!localStorage.getItem('fitlogic_profile')) {
      localStorage.setItem('fitlogic_profile', JSON.stringify({
        id: 'demo-user-id',
        email: 'guest@fitlogic.com',
        full_name: 'Guest Student',
        height: 175,
        weight: 78.5,
        target_weight: 72.0,
        target_calories: 2200
      }))
      
      const today = new Date()
      const formatD = (offset: number) => {
        const d = new Date(today)
        d.setDate(d.getDate() - offset)
        return d.toISOString().split('T')[0]
      }
      localStorage.setItem('fitlogic_workouts', JSON.stringify([
        { id: '1', name: 'Swimming', duration: 40, calories_burned: 450, date: formatD(0) },
        { id: '2', name: 'Leg Day Gym Session', duration: 70, calories_burned: 550, date: formatD(1) },
        { id: '3', name: 'Evening Cycling', duration: 50, calories_burned: 480, date: formatD(2) },
        { id: '4', name: 'Pull Day Gym Session', duration: 60, calories_burned: 400, date: formatD(3) },
        { id: '5', name: 'HIIT Cardio', duration: 30, calories_burned: 380, date: formatD(4) }
      ]))
      
      localStorage.setItem('fitlogic_bmi', JSON.stringify([
        { id: '1', height: 175, weight: 78.5, bmi: 25.6, category: 'Overweight', recorded_at: new Date().toISOString() }
      ]))

      localStorage.setItem('fitlogic_calories', JSON.stringify([
        { id: '1', age: 21, gender: 'male', height: 175, weight: 78.5, activity_level: 'moderate', goal: 'lose_slow', bmr: 1740, tdee: 2697, target_calories: 2447, recorded_at: new Date().toISOString() }
      ]))
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col justify-between">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 pointer-events-none filter blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 pointer-events-none filter blur-3xl opacity-40" />

      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              FITLOGIC
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-semibold">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#about" className="hover:text-foreground transition-colors">For Students</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-semibold hover:text-foreground hover:bg-muted cursor-pointer rounded-full px-4 h-9">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary-focus font-semibold text-primary-foreground cursor-pointer rounded-full px-5 h-9 transition-colors shadow-xs">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-28 md:pb-36 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              Tailored for Students & Young Adults
            </div>

            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.15] text-foreground">
              STAY SHARP.<br />
              TRAIN SMART.<br />
              <span className="text-primary">
                FITLOGIC.
              </span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-xl font-medium leading-relaxed">
              Ditch complicated trackers. FitLogic provides a sleek, high-fidelity experience to log workouts, check BMI, calculate metabolic daily calorie targets, and monitor health trends dynamically.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary-focus font-semibold text-white px-8 py-6 rounded-full shadow-xs transition-all text-base cursor-pointer flex items-center gap-2">
                  Get Started Free <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                onClick={handleTryDemo}
                variant="outline" 
                className="border-border bg-secondary hover:bg-secondary/80 text-foreground font-semibold px-8 py-6 rounded-full text-base cursor-pointer"
              >
                Try Demo Account
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">100%</p>
                <p className="text-xs text-muted-foreground font-medium">Free University Project</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">0%</p>
                <p className="text-xs text-muted-foreground font-medium">Ads & Premium Paywalls</p>
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-foreground">Supabase</p>
                <p className="text-xs text-muted-foreground font-medium">Secure Cloud Authentication</p>
              </div>
            </div>
          </motion.div>

          {/* Interactive UI Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">FITLOGIC DASHBOARD V1.0</span>
              </div>

              <div className="space-y-6">
                {/* Mock Card 1 */}
                <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Daily Calorie Target</p>
                      <p className="text-xl font-semibold tracking-tight text-foreground">2,450 kcal</p>
                    </div>
                  </div>
                  <div className="h-8 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-xs font-semibold rounded-full flex items-center justify-center gap-1">
                    Active
                  </div>
                </div>

                {/* Mock Card 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-background border border-border shadow-2xs">
                    <Scale className="h-5 w-5 text-primary mb-2" />
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Latest BMI</p>
                    <p className="text-xl font-semibold tracking-tight text-foreground">22.4</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-450 font-medium">Normal Weight</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background border border-border shadow-2xs">
                    <Dumbbell className="h-5 w-5 text-primary mb-2" />
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">This Week</p>
                    <p className="text-xl font-semibold tracking-tight text-foreground">4 Workouts</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Target: 5 workouts</p>
                  </div>
                </div>

                {/* Mock Chart representation */}
                <div className="p-4 rounded-2xl bg-background border border-border shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" /> Calories Burned Trends
                    </span>
                    <span className="text-[10px] text-muted-foreground">Last 5 days</span>
                  </div>
                  <div className="h-16 flex items-end gap-2 pt-2">
                    <div className="w-full bg-muted h-[30%] rounded-md hover:bg-primary transition-colors" />
                    <div className="w-full bg-muted h-[60%] rounded-md hover:bg-primary transition-colors" />
                    <div className="w-full bg-muted h-[45%] rounded-md hover:bg-primary transition-colors" />
                    <div className="w-full bg-muted h-[90%] rounded-md hover:bg-primary transition-colors" />
                    <div className="w-full bg-primary h-[75%] rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-border">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Engineered for Performance</h2>
            <p className="text-muted-foreground font-medium">Everything you need to track, evaluate, and scale your personal fitness journey without bloated sub-screens.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all duration-300 space-y-4 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">BMI Calculator</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Calculate BMI instantly using metric or imperial measurements. Maintain a detailed historical table to monitor weight shifts over time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all duration-300 space-y-4 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">Calorie Needs Calculator</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Uses the Mifflin-St Jeor equation to compute Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) based on your activity level.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all duration-300 space-y-4 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Dumbbell className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">Workout Logger</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                Perform CRUD operations on workouts. Track exercise types, durations, and calories burned to stay accountable to your weekly targets.
              </p>
            </div>
          </div>
        </section>

        {/* Focus Section */}
        <section id="about" className="max-w-7xl mx-auto px-6 py-16 border border-border bg-card rounded-3xl mb-16 shadow-xs">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground leading-tight">
                Designed for University Students & Active Lifestyles
              </h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                As college students and young adults, balance is everything. FitLogic is built to provide rapid, actionable summaries of your physical health.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Student Showpiece Project</h4>
                    <p className="text-sm text-muted-foreground font-medium">Built using Next.js 15, TypeScript, Supabase Auth/DB, and Tailwind CSS.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Privacy First</h4>
                    <p className="text-sm text-muted-foreground font-medium">Secure user data isolation. Your data is isolated using PostgreSQL Row Level Security.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border border-border bg-muted/20 rounded-2xl space-y-6">
              <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" /> Technical Architecture
              </h3>
              <div className="space-y-3 text-sm font-semibold text-muted-foreground">
                <div className="flex justify-between border-b border-border pb-2">
                  <span>Frontend</span>
                  <span className="text-foreground">Next.js 15 (App Router)</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span>Styling</span>
                  <span className="text-foreground">Tailwind CSS & shadcn/ui</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <span>Database & Auth</span>
                  <span className="text-foreground">Supabase (PostgreSQL)</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span>Interactive Charts</span>
                  <span className="text-foreground">Recharts Engine</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 text-muted-foreground text-sm font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">FITLOGIC</span>
            <span>© {new Date().getFullYear()} FitLogic. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Supabase</a>
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Next.js</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
