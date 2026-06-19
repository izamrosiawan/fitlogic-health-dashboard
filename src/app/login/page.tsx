"use client"

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Activity, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('next') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast.success('Logged in successfully!')
      router.push(redirectPath)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = () => {
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

    toast.success('Entering guest demo mode...')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background text-foreground overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 pointer-events-none filter blur-3xl opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 pointer-events-none filter blur-3xl opacity-35" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            FIT<span className="text-primary">LOGIC</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">Smart fitness & health tracking for students</p>
        </div>

        <Card className="border border-border bg-card shadow-xs">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Sign In</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Enter your credentials to access your fitness dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary-focus transition-colors font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-focus text-white font-semibold h-11 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleGuestLogin}
                variant="outline"
                className="w-full border-border bg-muted/65 hover:bg-muted text-foreground font-semibold h-11 rounded-xl cursor-pointer"
              >
                Access as Guest (Demo Mode)
              </Button>

              <p className="text-muted-foreground text-sm text-center font-medium">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-primary hover:text-primary-focus transition-colors font-semibold"
                >
                  Sign up free
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-bold">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
