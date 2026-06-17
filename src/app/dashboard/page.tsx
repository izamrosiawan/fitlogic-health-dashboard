"use client"

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { WelcomeSection } from '@/components/dashboard/WelcomeSection'
import { BmiWidget } from '@/components/dashboard/BmiWidget'
import { CalorieWidget } from '@/components/dashboard/CalorieWidget'
import { WorkoutWidget } from '@/components/dashboard/WorkoutWidget'
import { ProgressOverview } from '@/components/dashboard/ProgressOverview'
import { PageContainer } from '@/components/layout/PageContainer'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('Enthusiast')
  const [latestBmi, setLatestBmi] = useState<any>(null)
  const [latestCalorie, setLatestCalorie] = useState<any>(null)
  const [workoutCount, setWorkoutCount] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [totalCalories, setTotalCalories] = useState(0)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setDisplayName(profile?.full_name || user.user_metadata?.full_name || 'Enthusiast')

        // Fetch latest BMI record
        const { data: bmiData } = await supabase
          .from('bmi_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1)
        setLatestBmi(bmiData?.[0] || null)

        // Fetch latest Calorie record
        const { data: calorieData } = await supabase
          .from('calorie_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1)
        setLatestCalorie(calorieData?.[0] || null)

        // Fetch workouts from the last 7 days (trailing)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0]

        const { data: recentWorkouts } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', oneWeekAgoStr)
          .order('date', { ascending: true })

        // Aggregate weekly workout stats
        let count = 0
        let duration = 0
        let calories = 0

        if (recentWorkouts) {
          count = recentWorkouts.length
          duration = recentWorkouts.reduce((sum: number, w: any) => sum + (w.duration || 0), 0)
          calories = recentWorkouts.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0)
        }
        setWorkoutCount(count)
        setTotalDuration(duration)
        setTotalCalories(calories)

        // Build last 7 days chart data
        const tempChartData = []
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const dateStr = `${year}-${month}-${day}`
          
          const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
          
          const dailyWorkouts = recentWorkouts?.filter((w: any) => w.date === dateStr) || []
          const dailyCalories = dailyWorkouts.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0)

          tempChartData.push({
            date: dateLabel,
            calories: dailyCalories
          })
        }
        setChartData(tempChartData)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <PageContainer title="Dashboard" description="Loading your profile and trends...">
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <span className="text-sm font-semibold text-neutral-400">Loading Dashboard...</span>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Dashboard"
      description="Track and monitor your fitness trends and health metrics."
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <WelcomeSection userName={displayName} />

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BmiWidget latestBmi={latestBmi} />
          <CalorieWidget latestCalorie={latestCalorie} />
          <WorkoutWidget
            workoutCount={workoutCount}
            totalDuration={totalDuration}
            totalCalories={totalCalories}
          />
        </div>

        {/* Analytics Trailing Chart */}
        <ProgressOverview data={chartData} />
      </div>
    </PageContainer>
  )
}
