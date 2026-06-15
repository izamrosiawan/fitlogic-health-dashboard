"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Activity, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      // Check if session is already created (if email confirmation is disabled)
      if (data?.session) {
        toast.success('Registration successful! Welcome to FitLogic.')
        router.push('/dashboard')
        router.refresh()
      } else {
        setRegistered(true)
        toast.success('Check your email to verify your account!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign up. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-neutral-950 overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full radial-glow-orange pointer-events-none filter blur-3xl opacity-40" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full radial-glow-green pointer-events-none filter blur-3xl opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-wider text-white">
            FIT<span className="text-orange-500">LOGIC</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1 font-medium">Smart fitness & health tracking for students</p>
        </div>

        <Card className="glass-panel-glow border-neutral-900 bg-neutral-950/60 backdrop-blur-xl">
          {registered ? (
            <div className="p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
              <CardDescription className="text-neutral-400 text-base leading-relaxed">
                We've sent a verification link to <span className="text-white font-semibold">{email}</span>.
                Please click the link in the email to complete your registration.
              </CardDescription>
              <div className="pt-4">
                <Link href="/login" className="text-orange-400 hover:text-orange-300 font-bold transition-colors">
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
                <CardDescription className="text-neutral-400 font-medium">
                  Register now to start tracking your health parameters
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-neutral-300 font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-500 pointer-events-none" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Alex Carter"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-300 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-500 pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-neutral-300 font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-500 pointer-events-none" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-neutral-300 font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-500 pointer-events-none" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
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
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Sign Up <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-neutral-400 text-sm text-center font-medium">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="text-orange-400 hover:text-orange-300 transition-colors font-bold"
                    >
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
