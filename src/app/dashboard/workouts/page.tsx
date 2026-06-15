"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PageContainer } from '@/components/layout/PageContainer'
import { Dumbbell, Loader2, Trash2, Plus, Clock, Flame, Calendar, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { motion } from 'framer-motion'

interface Workout {
  id: string
  name: string
  duration: number
  calories_burned: number
  date: string
  notes: string | null
  created_at: string
}

export default function WorkoutsPage() {
  const supabase = createClient()

  // Form states
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('')
  const [caloriesBurned, setCaloriesBurned] = useState('')
  const [date, setDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
  const [notes, setNotes] = useState('')

  // List states
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loadingWorkouts, setLoadingWorkouts] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Aggregated Stats
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [totalKcal, setTotalKcal] = useState(0)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  useEffect(() => {
    // Recalculate stats when workouts list updates
    setTotalWorkouts(workouts.length)
    setTotalMinutes(workouts.reduce((sum, w) => sum + w.duration, 0))
    setTotalKcal(workouts.reduce((sum, w) => sum + w.calories_burned, 0))
  }, [workouts])

  const fetchWorkouts = async () => {
    setLoadingWorkouts(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkouts(data || [])
    } catch (err: any) {
      toast.error('Failed to load workouts: ' + err.message)
    } finally {
      setLoadingWorkouts(false)
    }
  }

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    const mins = parseInt(duration)
    const kcal = parseInt(caloriesBurned)

    if (!name.trim()) {
      toast.error('Please enter a workout name')
      return
    }

    if (isNaN(mins) || isNaN(kcal) || mins <= 0 || kcal <= 0) {
      toast.error('Please enter positive values for duration and calories')
      return
    }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase.from('workouts').insert({
        user_id: user.id,
        name: name.trim(),
        duration: mins,
        calories_burned: kcal,
        date,
        notes: notes.trim() || null
      }).select()

      if (error) throw error

      toast.success('Workout logged successfully!')
      
      // Clear form
      setName('')
      setDuration('')
      setCaloriesBurned('')
      setNotes('')
      // Set date back to today
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      setDate(`${year}-${month}-${day}`)

      // Update state local list
      if (data && data[0]) {
        setWorkouts([data[0], ...workouts])
      } else {
        fetchWorkouts()
      }
    } catch (err: any) {
      toast.error('Failed to log workout: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Workout deleted')
      setWorkouts(workouts.filter(w => w.id !== id))
    } catch (err: any) {
      toast.error('Failed to delete workout: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <PageContainer
      title="Workout Tracker"
      description="Log daily exercise sessions, calculate active energy expenditure, and manage logs."
    >
      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="bg-neutral-950 border-neutral-900 flex items-center justify-between p-6 hover:border-neutral-800 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-neutral-400 font-bold uppercase">Total Workouts</p>
            <h3 className="text-2xl font-extrabold text-white">{totalWorkouts} sessions</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Dumbbell className="h-5 w-5" />
          </div>
        </Card>

        <Card className="bg-neutral-950 border-neutral-900 flex items-center justify-between p-6 hover:border-neutral-800 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-neutral-400 font-bold uppercase">Total Duration</p>
            <h3 className="text-2xl font-extrabold text-white">{totalMinutes} min</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </Card>

        <Card className="bg-neutral-950 border-neutral-900 flex items-center justify-between p-6 hover:border-neutral-800 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-neutral-400 font-bold uppercase">Total Calories Burned</p>
            <h3 className="text-2xl font-extrabold text-white">{totalKcal} kcal</h3>
          </div>
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Add Workout Form */}
        <div className="lg:col-span-1">
          <Card className="bg-neutral-950 border-neutral-900 glass-panel">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-500" /> Log Session
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Log a completed exercise session
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddWorkout}>
              <CardContent className="space-y-4">
                {/* Workout Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-neutral-300 font-medium">Activity Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Morning Run, Push Gym Day"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                    required
                  />
                </div>

                {/* Duration / Calories in columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="duration" className="text-neutral-300 font-medium">Duration (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="e.g. 45"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="calories" className="text-neutral-300 font-medium">Burn (kcal)</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="e.g. 400"
                      value={caloriesBurned}
                      onChange={(e) => setCaloriesBurned(e.target.value)}
                      className="bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-neutral-300 font-medium">Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-500 pointer-events-none" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10 bg-neutral-900/50 border-neutral-800 focus:border-orange-500 text-white h-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-neutral-300 font-medium">Notes (optional)</Label>
                  <textarea
                    id="notes"
                    placeholder="e.g. Felt highly energetic, campus route"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-800 focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20 text-white p-2.5 text-sm rounded-xl min-h-[80px] outline-none transition-colors"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-10 rounded-xl cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Log Workout'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* History List */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-950 border-neutral-900 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Workout Sessions</CardTitle>
                <CardDescription className="text-neutral-400">
                  Detailed logs of logged exercise activities
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchWorkouts}
                className="border-neutral-800 hover:bg-neutral-900 text-neutral-400 cursor-pointer h-8 w-8"
                disabled={loadingWorkouts}
              >
                <RefreshCw className={`h-4 w-4 ${loadingWorkouts ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {loadingWorkouts ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500 space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="text-sm font-semibold">Loading logs...</span>
                </div>
              ) : workouts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-neutral-900">
                      <TableRow className="border-neutral-900 hover:bg-transparent">
                        <TableHead className="text-neutral-400 font-bold">Activity</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Date</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Duration</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Burned</TableHead>
                        <TableHead className="text-neutral-400 font-bold">Notes</TableHead>
                        <TableHead className="text-neutral-400 font-bold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workouts.map((w) => (
                        <TableRow key={w.id} className="border-neutral-900 hover:bg-neutral-900/30 text-neutral-200">
                          <TableCell className="font-extrabold text-white">{w.name}</TableCell>
                          <TableCell className="font-semibold text-xs whitespace-nowrap">
                            {new Date(w.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="font-medium text-xs whitespace-nowrap">{w.duration} min</TableCell>
                          <TableCell className="font-extrabold text-orange-500 text-sm whitespace-nowrap">{w.calories_burned} kcal</TableCell>
                          <TableCell className="max-w-[200px] text-xs text-neutral-400 truncate font-medium">
                            {w.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(w.id)}
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer h-7 w-7"
                              disabled={deletingId === w.id}
                            >
                              {deletingId === w.id ? (
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
                  <Dumbbell className="h-12 w-12 text-neutral-600 animate-pulse" />
                  <p className="text-base font-bold text-neutral-400">No logged workouts yet</p>
                  <p className="text-xs text-neutral-500 max-w-sm">Use the form on the left to log your first exercise session and start counting calories.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
