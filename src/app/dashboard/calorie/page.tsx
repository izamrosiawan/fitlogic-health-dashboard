"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { Flame, Loader2, Trash2, Plus, Info, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'

interface CalorieRecord {
  id: string
  age: number
  gender: string
  height: number
  weight: number
  activity_level: string
  goal: string
  bmr: number
  tdee: number
  target_calories: number
  recorded_at: string
}

export default function CaloriePage() {
  const supabase = createClient()

  // Form states
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [activityLevel, setActivityLevel] = useState<string>('moderate')
  const [goal, setGoal] = useState<string>('maintain')

  // Calculation results
  const [bmr, setBmr] = useState<number | null>(null)
  const [tdee, setTdee] = useState<number | null>(null)
  const [targetCalories, setTargetCalories] = useState<number | null>(null)

  // List states
  const [records, setRecords] = useState<CalorieRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoadingRecords(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('calorie_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err: any) {
      toast.error('Failed to load calorie history: ' + err.message)
    } finally {
      setLoadingRecords(false)
    }
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()
    const a = parseInt(age)
    const h = parseFloat(height)
    const w = parseFloat(weight)

    if (isNaN(a) || isNaN(h) || isNaN(w) || a <= 0 || h <= 0 || w <= 0) {
      toast.error('Please enter valid positive numbers')
      return
    }

    // 1. Calculate BMR using Mifflin-St Jeor Equation
    let computedBmr = 0
    if (gender === 'male') {
      computedBmr = 10 * w + 6.25 * h - 5 * a + 5
    } else {
      computedBmr = 10 * w + 6.25 * h - 5 * a - 161
    }

    // 2. Calculate TDEE based on activity multiplier
    let multiplier = 1.2
    switch (activityLevel) {
      case 'sedentary':
        multiplier = 1.2
        break
      case 'light':
        multiplier = 1.375
        break
      case 'moderate':
        multiplier = 1.55
        break
      case 'active':
        multiplier = 1.725
        break
      case 'extra_active':
        multiplier = 1.9
        break
    }
    const computedTdee = computedBmr * multiplier

    // 3. Adjust Target Calories based on Goal
    let computedTarget = computedTdee
    switch (goal) {
      case 'lose_fast':
        computedTarget = computedTdee - 500
        break
      case 'lose_slow':
        computedTarget = computedTdee - 250
        break
      case 'maintain':
        computedTarget = computedTdee
        break
      case 'gain_slow':
        computedTarget = computedTdee + 250
        break
      case 'gain_fast':
        computedTarget = computedTdee + 500
        break
    }

    // Enforce safety floor
    if (computedTarget < 1200) {
      toast.warning('Recommended daily calories are below 1200 kcal. Daily intake below 1200 kcal is not advised without medical supervision.')
    }

    setBmr(Math.round(computedBmr))
    setTdee(Math.round(computedTdee))
    setTargetCalories(Math.round(computedTarget))
  }

  const handleSave = async () => {
    if (bmr === null || tdee === null || targetCalories === null) return
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('calorie_records').insert({
        user_id: user.id,
        age: parseInt(age),
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        activity_level: activityLevel,
        goal,
        bmr,
        tdee,
        target_calories: targetCalories
      })

      if (error) throw error

      toast.success('Calorie profile saved successfully!')
      // Clear form
      setAge('')
      setHeight('')
      setWeight('')
      setBmr(null)
      setTdee(null)
      setTargetCalories(null)
      
      // Refresh list
      fetchRecords()
    } catch (err: any) {
      toast.error('Failed to save calorie configuration: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('calorie_records')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Record deleted')
      setRecords(records.filter(r => r.id !== id))
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const getActivityLabel = (level: string) => {
    switch (level) {
      case 'sedentary': return 'Sedentary'
      case 'light': return 'Lightly Active'
      case 'moderate': return 'Moderately Active'
      case 'active': return 'Very Active'
      case 'extra_active': return 'Extra Active'
      default: return level
    }
  }

  const getGoalLabel = (g: string) => {
    switch (g) {
      case 'lose_fast': return 'Lose Weight (Fast)'
      case 'lose_slow': return 'Lose Weight (Slow)'
      case 'maintain': return 'Maintain'
      case 'gain_slow': return 'Gain Weight (Slow)'
      case 'gain_fast': return 'Gain Weight (Fast)'
      default: return g
    }
  }

  return (
    <PageContainer
      title="Calorie Calculator"
      description="Estimate daily energy needs and budget calorie targets with the Mifflin-St Jeor model."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Calorie Calculator Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-neutral-950 border-neutral-900 glass-panel">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" /> Energy Budget
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Determine your metabolic rate
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCalculate}>
              <CardContent className="space-y-4">
                
                {/* Age Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-neutral-300 font-medium">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 21"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                      required
                    />
                  </div>
                  
                  {/* Gender Selector */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-neutral-300 font-medium">Gender</Label>
                    <Select value={gender} onValueChange={(val) => { if (val === 'male' || val === 'female') setGender(val) }}>
                      <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-white rounded-xl h-10">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white rounded-xl">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Height / Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="height" className="text-neutral-300 font-medium">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="any"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="weight" className="text-neutral-300 font-medium">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="any"
                      placeholder="e.g. 70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-1.5">
                  <Label htmlFor="activity" className="text-neutral-300 font-medium">Activity Multiplier</Label>
                  <Select value={activityLevel} onValueChange={(val) => { if (val) setActivityLevel(val) }}>
                    <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-white rounded-xl h-10">
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white rounded-xl">
                      <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
                      <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
                      <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                      <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                      <SelectItem value="extra_active">Extra Active (Hard physical work)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fitness Goal */}
                <div className="space-y-1.5">
                  <Label htmlFor="goal" className="text-neutral-300 font-medium">Target Fitness Goal</Label>
                  <Select value={goal} onValueChange={(val) => { if (val) setGoal(val) }}>
                    <SelectTrigger className="w-full bg-neutral-900 border-neutral-800 text-white rounded-xl h-10">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white rounded-xl">
                      <SelectItem value="lose_fast">Lose Weight Fast (-500 kcal)</SelectItem>
                      <SelectItem value="lose_slow">Lose Weight Slow (-250 kcal)</SelectItem>
                      <SelectItem value="maintain">Maintain Current Weight</SelectItem>
                      <SelectItem value="gain_slow">Gain Weight Slow (+250 kcal)</SelectItem>
                      <SelectItem value="gain_fast">Gain Weight Fast (+500 kcal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-10 rounded-xl cursor-pointer"
                >
                  Calculate Budget
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Calorie Output Results */}
          <AnimatePresence>
            {targetCalories !== null && bmr !== null && tdee !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-neutral-950 border-neutral-900 bg-gradient-to-r from-orange-500/5 to-neutral-950">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Calculated Budget</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div className="text-4xl font-extrabold text-white">
                        {targetCalories} <span className="text-xs font-semibold text-neutral-500">kcal/day</span>
                      </div>
                      <div className="text-xs px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400 font-bold uppercase">
                        {getGoalLabel(goal).split(' ')[0]}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-neutral-400 border-t border-neutral-900 pt-3">
                      <div>
                        <p className="uppercase text-[10px] text-neutral-500 font-bold">Basal Metabolic Rate</p>
                        <p className="text-white font-bold text-sm mt-0.5">{bmr} kcal</p>
                      </div>
                      <div>
                        <p className="uppercase text-[10px] text-neutral-500 font-bold">Daily Active Needs (TDEE)</p>
                        <p className="text-white font-bold text-sm mt-0.5">{tdee} kcal</p>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-900 text-xs text-neutral-400 leading-relaxed font-medium flex gap-2">
                      <Info className="h-4.5 w-4.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>
                        Targets are based on the Mifflin-St Jeor formula. Maintain this target to safely align with your weights strategy.
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSave}
                      disabled={submitting}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4.5 w-4.5" /> Save Target to Profile
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Calorie History List */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-950 border-neutral-900 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Calorie History</CardTitle>
                <CardDescription className="text-neutral-400">
                  Track calculations and changes in daily energy budgets
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchRecords}
                className="border-neutral-800 hover:bg-neutral-900 text-neutral-400 cursor-pointer h-8 w-8"
                disabled={loadingRecords}
              >
                <RefreshCw className={`h-4 w-4 ${loadingRecords ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500 space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="text-sm font-semibold">Loading history...</span>
                </div>
              ) : records.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-neutral-900">
                      <TableRow className="border-neutral-900 hover:bg-transparent">
                        <TableHead className="text-neutral-400 font-bold">Date</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Parameters</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Multiplier</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Goal</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Target</TableHead>
                        <TableHead className="text-neutral-400 font-bold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((rec) => (
                        <TableRow key={rec.id} className="border-neutral-900 hover:bg-neutral-900/30 text-neutral-200">
                          <TableCell className="font-semibold text-sm">
                            {new Date(rec.recorded_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="font-medium text-xs space-y-0.5">
                            <p>Age: {rec.age} | Gen: {rec.gender}</p>
                            <p className="text-neutral-500">{rec.weight} kg | {rec.height} cm</p>
                          </TableCell>
                          <TableCell className="font-medium text-xs">
                            {getActivityLabel(rec.activity_level)}
                          </TableCell>
                          <TableCell className="font-semibold text-xs">
                            {getGoalLabel(rec.goal)}
                          </TableCell>
                          <TableCell className="font-extrabold text-orange-500 text-sm">
                            {rec.target_calories} kcal
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(rec.id)}
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer h-7 w-7"
                              disabled={deletingId === rec.id}
                            >
                              {deletingId === rec.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 space-y-3">
                  <Flame className="h-12 w-12 text-neutral-600 animate-pulse" />
                  <p className="text-base font-bold text-neutral-400">No calorie logs yet</p>
                  <p className="text-xs text-neutral-500 max-w-sm">Use the tool on the left to estimate BMR/TDEE and customize your target profiles.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </PageContainer>
  )
}
