"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { User, Loader2, Save, Key, Shield, Info, Calendar, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ProfilePage() {
  const supabase = createClient()
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  // Auth/Meta states
  const [email, setEmail] = useState('')
  const [joinDate, setJoinDate] = useState('')

  // Form states - Profile Details
  const [fullName, setFullName] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  // Form states - Fitness Goals
  const [targetWeight, setTargetWeight] = useState('')
  const [targetCalories, setTargetCalories] = useState('')

  // Form states - Password Change
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || '')
      setJoinDate(new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))

      // Fetch user profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is code for single result not found - which can happen for fresh signups before trigger finishes (or if trigger failed)
        throw error
      }

      if (profile) {
        setFullName(profile.full_name || '')
        setHeight(profile.height?.toString() || '')
        setWeight(profile.weight?.toString() || '')
        setTargetWeight(profile.target_weight?.toString() || '')
        setTargetCalories(profile.target_calories?.toString() || '')
      } else {
        // Fallback to auth metadata if profile not synced
        setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '')
      }

    } catch (err: any) {
      toast.error('Failed to load profile details: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingProfile(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updates = {
        id: user.id,
        email,
        full_name: fullName.trim(),
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        target_weight: targetWeight ? parseFloat(targetWeight) : null,
        target_calories: targetCalories ? parseInt(targetCalories) : null,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error
      
      // Update auth user metadata full_name if updated
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      })

      toast.success('Profile and fitness goals updated successfully!')
      fetchProfile()
    } catch (err: any) {
      toast.error('Failed to update profile: ' + err.message)
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      toast.error('Please enter new password and confirm password')
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

    setUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error('Failed to update password: ' + err.message)
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <PageContainer
      title="Profile Settings"
      description="Update your details, customize fitness targets, and manage security settings."
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-muted-foreground space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm font-semibold">Loading profile settings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* General Information Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border text-card-foreground">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-xl">
                    {fullName ? fullName[0].toUpperCase() : <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground leading-snug">{fullName || 'Fitness Enthusiast'}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="border-t border-border pt-4 space-y-3 text-xs font-semibold text-muted-foreground">
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> Member Since</span>
                  <span className="text-foreground">{joinDate}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Status</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase text-[10px]">Verified</span>
                </div>
              </CardContent>
            </Card>

            {/* Quote details */}
            <Card className="bg-card border border-border text-card-foreground">
              <CardContent className="p-5 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> FitLogic Guidelines
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Update your weight and height here to keep BMI history updated. Setting target weight and target calories helps display visual bounds throughout calculators.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border text-card-foreground">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <User className="h-5 w-5 text-primary" /> Account & Goals
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your display details and set targets for dashboard benchmarks
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  
                  {/* General Profile fields */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 md:col-span-1">
                        <Label htmlFor="fullName" className="text-foreground font-medium">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="height" className="text-foreground font-medium">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          step="any"
                          placeholder="e.g. 175"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="weight" className="text-foreground font-medium">Current Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="any"
                          placeholder="e.g. 72.5"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Target Goal fields */}
                  <div className="space-y-4 border-t border-border pt-6">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fitness Targets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="targetWeight" className="text-foreground font-medium">Target Weight (kg)</Label>
                        <Input
                          id="targetWeight"
                          type="number"
                          step="any"
                          placeholder="e.g. 70.0"
                          value={targetWeight}
                          onChange={(e) => setTargetWeight(e.target.value)}
                          className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="targetCalories" className="text-foreground font-medium">Target Daily Calories (kcal)</Label>
                        <Input
                          id="targetCalories"
                          type="number"
                          placeholder="e.g. 2200"
                          value={targetCalories}
                          onChange={(e) => setTargetCalories(e.target.value)}
                          className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                </CardContent>
                <CardFooter className="border-t border-border pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingProfile}
                    className="bg-primary hover:bg-primary-focus text-white font-semibold h-10 rounded-xl cursor-pointer flex items-center gap-2 transition-colors shadow-xs"
                  >
                    {updatingProfile ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" /> Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Change Password Card */}
            <Card className="bg-card border-border text-card-foreground">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Key className="h-5 w-5 text-primary" /> Security settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update password authentication credentials
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleChangePassword}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="pass" className="text-foreground font-medium">New Password</Label>
                      <Input
                        id="pass"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                        required
                        disabled={updatingPassword}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confPass" className="text-foreground font-medium">Confirm Password</Label>
                      <Input
                        id="confPass"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground h-10 rounded-xl"
                        required
                        disabled={updatingPassword}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingPassword}
                    className="bg-background hover:bg-muted border border-border text-primary font-semibold h-10 rounded-xl cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    {updatingPassword ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Key className="h-4.5 w-4.5 text-primary" /> Change Password
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
